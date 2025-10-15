import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseSubsidebarItem } from "./course-subsidebar-item";
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
  // Load subchapters for all chapters to display under each chapter
  const chapterIds = course.chapters.map((c) => c.id);
  const subchapters = chapterIds.length
    ? await (db as any).subChapter.findMany({
        where: { chapterId: { in: chapterIds } },
        select: { id: true, title: true, chapterId: true, position: true },
        orderBy: { position: "asc" },
      })
    : [];
  const subByChapter = new Map<string, { id: string; title: string }[]>();
  for (const sc of subchapters) {
    const arr = subByChapter.get(sc.chapterId) ?? [];
    arr.push({ id: sc.id, title: sc.title });
    subByChapter.set(sc.chapterId, arr);
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
          <div key={chapter.id}>
            <CourseSidebarItem
              id={chapter.id}
              label={chapter.title}
              isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
              courseId={course.id}
              isLocked={!chapter.isFree && !purchase}
            />
            {subByChapter.get(chapter.id)?.length ? (
              <div className="pl-4">
                {subByChapter.get(chapter.id)!.map((sc) => (
                  <CourseSubsidebarItem
                    key={sc.id}
                    id={sc.id}
                    label={sc.title}
                    courseId={course.id}
                    chapterId={chapter.id}
                    isLocked={!chapter.isFree && !purchase}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
