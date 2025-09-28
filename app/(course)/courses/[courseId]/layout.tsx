import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();
  // Determine admin/owner privileges
  const me = userId ? await db.user.findUnique({ where: { clerkId: userId } }) : null;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!(me?.email && adminEmails.includes(me.email.toLowerCase()));

  // Step 1: get course meta to determine ownership/publish status
  const courseMeta = await db.course.findUnique({
    where: { id: params.courseId },
    select: { id: true, userId: true, isPublished: true },
  });

  const isOwner = !!(userId && courseMeta?.userId && me && courseMeta.userId === me.id);
  const canBypassPublish = isAdmin || isOwner;

  if (!courseMeta || (!courseMeta.isPublished && !canBypassPublish)) {
    console.log("Course not found with ID:", params.courseId);
    return redirect("/");
  }

  // Step 2: fetch full course with chapters filtered per privilege
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: {
        where: canBypassPublish ? {} : { isPublished: true },
        ...(userId
          ? {
              include: {
                userProgress: {
                  where: { userId },
                },
              },
            }
          : {}),
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    console.log("Course not found after meta check:", params.courseId);
    return redirect("/");
  }

  const progressCount = userId ? await getProgress(userId, course.id) : 0;

  return (
    <div className="h-full flex">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex w-80 flex-col fixed inset-y-0 left-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="flex-1 md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
