import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, NotebookText, LayoutDashboard, Video } from "lucide-react";
import { SubchapterTitleForm } from "./_components/subchapter-title-form";
import { SubchapterTypeForm } from "./_components/subchapter-type-form";
import { SubchapterContentForm } from "./_components/subchapter-content-form";
import { SubchapterVideoForm } from "./_components/subchapter-video-form";
import { Banner } from "@/components/banner";
import { IconBadge } from "@/components/icon-badge";
import { SubchapterAssignmentsForm } from "./_components/subchapter-assignments-form";
import { SubchapterQuizzesForm } from "./_components/subchapter-quizzes-form";
import { SubchapterActions } from "./_components/subchapter-actions";

export default async function SubchapterEditPage({
  params,
}: {
  params: { courseId: string; chapterId: string; subchapterId: string };
}) {
  const { userId } = auth();
  if (!userId) return redirect("/");

  // Load subchapter to edit
  const subchapter = await prisma.subChapter.findFirst({
    where: { id: params.subchapterId, chapterId: params.chapterId },
    select: { id: true, title: true, type: true, content: true, videoUrl: true, videoId: true, isPublished: true },
  });

  if (!subchapter) return redirect("/");

  // Load related items
  const [assignments, quizzes] = await Promise.all([
    prisma.subChapterAssignment.findMany({
      where: { subchapterId: params.subchapterId },
      select: { id: true, name: true, url: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subChapterQuiz.findMany({
      where: { subchapterId: params.subchapterId },
      select: { id: true, name: true, url: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      {!subchapter.isPublished && (
        <Banner
          variant="warning"
          label="This subchapter is yet to be published. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}/chapters/${params.chapterId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2 " />
              Back to chapter set up...
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Subchapter Creation</h1>
                <span className="text-sm text-slate-700">
                  Configure subchapter details
                </span>
              </div>
              <SubchapterActions
                courseId={params.courseId}
                chapterId={params.chapterId}
                subchapterId={params.subchapterId}
                isPublished={!!subchapter.isPublished}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 mt-16">
          <div className="col-span-6 space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} variant="success" size="sm" />
              <h2 className="text-xl">Details</h2>
            </div>
            <SubchapterTitleForm
              courseId={params.courseId}
              chapterId={params.chapterId}
              subchapterId={params.subchapterId}
              initialTitle={subchapter.title || ""}
            />
            <SubchapterTypeForm
              courseId={params.courseId}
              chapterId={params.chapterId}
              subchapterId={params.subchapterId}
              initialType={subchapter.type || undefined}
            />
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={NotebookText} />
                <h2 className="text-xl">Content</h2>
              </div>
              <SubchapterContentForm
                courseId={params.courseId}
                chapterId={params.chapterId}
                subchapterId={params.subchapterId}
                initialContent={subchapter.content || undefined}
              />
            </div>
          </div>
          <div className="col-span-6 space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-l">Subchapter Video</h2>
            </div>
            <SubchapterVideoForm
              courseId={params.courseId}
              chapterId={params.chapterId}
              subchapterId={params.subchapterId}
              initialVideoUrl={subchapter.videoUrl || undefined}
              initialVideoId={subchapter.videoId || undefined}
            />
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <header className="mb-6">
            <div className="flex items-center gap-x-2 justify-center">
              <IconBadge icon={NotebookText} variant="success" size="sm" />
              <h1 className="text-2xl font-medium">Subchapter Quizzes & Assignments</h1>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-6 col-span-6 mt-6">
            <SubchapterAssignmentsForm
              courseId={params.courseId}
              chapterId={params.chapterId}
              subchapterId={params.subchapterId}
              items={assignments || []}
            />
            <SubchapterQuizzesForm
              courseId={params.courseId}
              chapterId={params.chapterId}
              subchapterId={params.subchapterId}
              items={quizzes || []}
            />
          </div>
        </div>
      </div>
    </>
  );
}
