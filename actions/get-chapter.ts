import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";

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
    const purchase = userId ? await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    }) : null;

    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
      },
      select: {
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
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!chapter || !course) {
      throw new Error("Chapter or Course not found");
    }

    // Build author object from local DB, fallback to Clerk if missing
    let authorName = [course.user?.firstName, course.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    let authorImageUrl = course.user?.imageUrl ?? null;

    if (!authorName && course.user?.clerkId) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerkUser = await clerkClient.users.getUser(course.user.clerkId);
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
      const email = course.user?.email || "";
      const local = email.includes("@") ? email.split("@")[0] : "";
      const sanitized = local.replace(/^unknown\+user_.+$/, "").trim();
      authorName = sanitized || "Instructor";
    }

    let muxData = null;
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
      muxData = await db.muxData.findUnique({
        where: {
          chapterId: chapterId,
        },
      });

      nextChapter = await db.chapter.findFirst({
        where: {
          courseId: courseId,
          isPublished: true,
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
      course,
      muxData,
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
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
      author: null,
    };
  }
};
