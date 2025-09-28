import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";
import { getRoleInfo } from "@/lib/auth-roles";

interface GetChapterProps {
  userId?: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // Determine caller identity & privileges (role first, then ADMIN_EMAILS fallback)
    const { me, isAdmin } = await getRoleInfo(userId ?? null);

    // Load course without enforcing publish (we'll enforce after we know owner/admin)
    const courseBasic = await db.course.findUnique({
      where: { id: courseId },
      select: {
        isPublished: true,
        price: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true,
            clerkId: true,
          },
        },
      },
    });

    const isOwner = !!(userId && courseBasic?.user?.clerkId === userId);
    const canBypassPublish = isAdmin || isOwner;

    // If not allowed and course is not published, deny
    if (!courseBasic || (!courseBasic.isPublished && !canBypassPublish)) {
      throw new Error("Chapter or Course not found");
    }

    // Load chapter with conditional publish filter
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        ...(canBypassPublish ? {} : { isPublished: true }),
      },
    });

    if (!chapter) {
      throw new Error("Chapter or Course not found");
    }

    // Build author object from local DB, fallback to Clerk if missing
    let authorName = [courseBasic.user?.firstName, courseBasic.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    let authorImageUrl = courseBasic.user?.imageUrl ?? null;

    if (!authorName && courseBasic.user?.clerkId) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerkUser = await clerkClient.users.getUser(courseBasic.user.clerkId);
        const cFirst = (clerkUser.firstName as string | null) ?? undefined;
        const cLast = (clerkUser.lastName as string | null) ?? undefined;
        const cImage = (clerkUser.imageUrl as string | null) ?? undefined;
        authorName = [cFirst, cLast].filter(Boolean).join(" ").trim();
        authorImageUrl = authorImageUrl || cImage || null;
      } catch (e) {
        // ignore clerk fallback errors; leave defaults
      }
    }

    if (!authorName) {
      // Try sanitized email local-part (avoid unknown+user_* patterns)
      const email = courseBasic.user?.email || "";
      const local = email.includes("@") ? email.split("@")[0] : "";
      const sanitized = local.replace(/^unknown\+user_.+$/, "").trim();
      authorName = sanitized || "Instructor";
    }

    const purchase = userId ? await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    }) : null;

    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await db.attachment.findMany({
        where: {
          courseId: courseId,
        },
      });
    }

    if (chapter.isFree || purchase) {
      nextChapter = await db.chapter.findFirst({
        where: {
          courseId: courseId,
          ...(canBypassPublish ? {} : { isPublished: true }),
          position: {
            gt: chapter?.position,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }

    const userProgress = userId ? await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    }) : null;
    return {
      chapter,
      course: {
        price: courseBasic.price,
        user: courseBasic.user,
      },
      attachments,
      nextChapter,
      userProgress,
      purchase,
      author: {
        name: authorName,
        imageUrl: authorImageUrl,
      },
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
      author: null,
    };
  }
};
