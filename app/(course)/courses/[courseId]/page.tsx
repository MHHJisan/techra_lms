import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  const me = userId ? await db.user.findUnique({ where: { clerkId: userId } }) : null;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!(me?.email && adminEmails.includes(me.email.toLowerCase()));

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: isAdmin
          ? {}
          : {
              isPublished: true,
            },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const isOwner = !!(userId && course?.userId && me && course.userId === me.id);
  const canBypassPublish = isAdmin || isOwner;

  if (!course || (!course.isPublished && !canBypassPublish)) {
    return redirect("/");
  }

  if (!course.chapters || course.chapters.length === 0) {
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
};

export default CourseIdPage;
