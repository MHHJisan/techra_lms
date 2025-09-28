import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getRoleInfo } from "@/lib/auth-roles";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  const { me, isAdmin } = await getRoleInfo(userId ?? null);

  // Step 1: fetch minimal meta to determine ownership
  const courseMeta = await db.course.findUnique({
    where: { id: params.courseId },
    select: { id: true, userId: true, isPublished: true },
  });

  const isOwner = !!(userId && courseMeta?.userId && me && courseMeta.userId === me.id);
  const canBypassPublish = isAdmin || isOwner;

  if (!courseMeta || (!courseMeta.isPublished && !canBypassPublish)) {
    return redirect("/");
  }

  // Step 2: fetch full course with proper chapter visibility
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: {
        where: canBypassPublish ? {} : { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course || !course.chapters || course.chapters.length === 0) {
    if (canBypassPublish) {
      return redirect(`/teacher/courses/${courseMeta.id}`);
    }
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
};

export default CourseIdPage;
