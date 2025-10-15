import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { Preview } from "@/components/preview";
import { Separator } from "@/components/ui/separator";
import { FileQuestion, FileText } from "lucide-react";
import Image from "next/image";
import { VideoPlayer } from "../../_components/video-player";

export default async function SubchapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string; subchapterId: string };
}) {
  const { userId } = auth();

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    select: { id: true, price: true, isPublished: true },
  });
  const chapter = await db.chapter.findUnique({
    where: { id: params.chapterId },
    select: { id: true, title: true, isFree: true, isPublished: true },
  });
  const subchapter = await (db as any).subChapter.findUnique({
    where: { id: params.subchapterId },
    select: { id: true, title: true, content: true, videoUrl: true, isPublished: true },
  });

  if (!course || !chapter || !subchapter) return redirect("/");

  // Purchase lock: same rule as chapter page
  let purchase: { id: string } | null = null;
  if (userId) {
    const me = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (me) {
      purchase = await db.purchase.findUnique({
        where: { userId_courseId: { userId: me.id, courseId: course.id } },
        select: { id: true },
      });
    }
  }

  const isLocked = !chapter.isFree && !purchase;
  const isUnpublished = !course.isPublished || !chapter.isPublished || !subchapter.isPublished;

  if (isUnpublished) {
    return (
      <div className="w-full p-6">
        <div className="max-w-3xl mx-auto rounded-md border bg-white p-6">
          <h1 className="text-xl font-semibold mb-2">This subchapter isn’t published yet</h1>
          <p className="text-sm text-slate-600">It will be available once the instructor publishes it.</p>
        </div>
      </div>
    );
  }

  // Load subchapter-specific resources
  const [assignments, quizzes] = await Promise.all([
    (db as any).subChapterAssignment.findMany({ where: { subchapterId: params.subchapterId } }),
    (db as any).subChapterQuiz.findMany({ where: { subchapterId: params.subchapterId } }),
  ]);

  const videoUrlOrId = subchapter.videoUrl || "";

  return (
    <div className="w-full p-6 px-6">
      {isLocked && (
        <Banner variant="warning" label="You need to purchase this course to access this subchapter" />
      )}
      <div className="w-full p-6">
        {videoUrlOrId && (
          <div className="-mx-4 md:-mx-6">
            <div className="relative w-full aspect-[16/7] rounded-md overflow-hidden bg-black">
              <VideoPlayer
                chapterId={params.chapterId}
                courseId={params.courseId}
                videoUrlOrId={videoUrlOrId}
                isLocked={isLocked}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mg-2">{subchapter.title}</h2>
          </div>
          <Separator />
          <div>
            {subchapter.content ? (
              <Preview value={subchapter.content} />
            ) : (
              <p className="text-sm text-slate-600 italic">No content provided.</p>
            )}
          </div>

          {/* Assignments */}
          {assignments.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-medium">Assignments (PDF/Text)</h3>
                {isLocked && (
                  <p className="text-xs text-slate-500">Unlock this course to download assignments.</p>
                )}
                {assignments.map((a: any) => {
                  const ItemInner = (
                    <div className="flex items-center p-3 w-full bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md">
                      <FileText className="h-4 w-4 mr-2" />
                      <p className="text-sm line-clamp-1">{a.name}</p>
                    </div>
                  );
                  return isLocked ? (
                    <div key={a.id}>{ItemInner}</div>
                  ) : (
                    <a key={a.id} href={a.url} target="_blank" className="hover:underline">
                      {ItemInner}
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-medium">Quizzes (PDF)</h3>
                {isLocked && (
                  <p className="text-xs text-slate-500">Unlock this course to view quizzes.</p>
                )}
                {quizzes.map((q: any) => {
                  const ItemInner = (
                    <div className="flex items-center p-3 w-full bg-amber-50 border border-amber-100 text-amber-700 rounded-md">
                      <FileQuestion className="h-4 w-4 mr-2" />
                      <p className="text-sm line-clamp-1">{q.name}</p>
                    </div>
                  );
                  return isLocked ? (
                    <div key={q.id}>{ItemInner}</div>
                  ) : (
                    <a key={q.id} href={q.url} target="_blank" className="hover:underline">
                      {ItemInner}
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
