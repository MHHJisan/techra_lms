import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress?: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!course) {
    return <p>Course data not available.</p>;
  }

  // Resolve internal DB user id from Clerk id, then check purchase with User.id
  let purchase: { id: string } | null = null;
  if (userId) {
    const me = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (me) {
      purchase = await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: me.id,
            courseId: course.id,
          },
        },
        select: { id: true },
      });
    }
  }
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div>
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div>
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};
