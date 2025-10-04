import type { Metadata } from "next";
import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File, FileQuestion, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";
import CourseJsonLd from "@/components/seo/CourseJsonLd";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(
  { params }: { params: { courseId: string; chapterId: string } }
): Promise<Metadata> {
  const { chapter, course } = await getChapter({
    userId: undefined,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return {
      title: "Course chapter",
    };
  }

  const title = chapter.title || "Course chapter";
  // Strip rich content to a short plain description
  const rawDesc = (chapter.description || "") as unknown as string;
  const description = rawDesc
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const canonical = `${siteUrl}/courses/${params.courseId}/chapters/${params.chapterId}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${canonical}?lang=en`,
        bn: `${canonical}?lang=bn`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: undefined,
    },
  };
}

const ChapterIdPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
  };
}) => {
  const { userId } = auth();

  const {
    chapter,
    course,
    attachments,
    // nextChapter,
    userProgress,
    purchase,
    author,
  } = await getChapter({
    userId: userId || undefined,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/");
  }
  const isLocked = !chapter.isFree && !purchase;

  // Always load chapter-level resources; we will disable links if locked
  const [materials, assignments, quizzes] = await Promise.all([
    db.chapterMaterial.findMany({ where: { chapterId: params.chapterId } }),
    db.chapterAssignment.findMany({ where: { chapterId: params.chapterId } }),
    db.chapterQuiz.findMany({ where: { chapterId: params.chapterId } }),
  ]);
  // const completeOnEnd = !!purchase && !userProgress?.isCompleted;
  const videoUrlOrId = chapter.videoUrl || "";

  return (
    <div className="w-full p-6 px-6">
      <CourseJsonLd
        url={`${siteUrl}/courses/${params.courseId}/chapters/${params.chapterId}`}
        courseId={params.courseId}
        courseTitle={chapter.title || "Course"}
        courseDescription={(chapter.description as unknown as string) || ""}
        priceBDT={course.price ? Number(course.price as unknown as number) : null}
        providerName="TECHRA LMS"
        providerUrl={siteUrl}
        breadcrumbs={[
          { name: "Courses", item: `${siteUrl}/courses` },
          { name: "Course", item: `${siteUrl}/courses/${params.courseId}` },
          { name: chapter.title, item: `${siteUrl}/courses/${params.courseId}/chapters/${params.chapterId}` },
        ]}
      />
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="You have already completed this chapter"
        />
      )}
      {isLocked && (
        <Banner variant="warning" label="You need to purchase this chapter" />
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
            <h2 className="text-2xl font-semibold mg-2">{chapter.title}</h2>
            {purchase ? (
              <div> {/*todo: add course progress button */} </div>
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!.toNumber()}
              />
            )}
          </div>
          {/* Instructor Info */}
          <div className="px-4 -mt-2 mb-2 flex items-center gap-3 text-sm text-slate-600">
            {author?.imageUrl && (
              <Image
                src={author.imageUrl}
                alt={author.name || "Instructor"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
            <span>Instructor: {author?.name || "Instructor"}</span>
          </div>
          <Separator />
          <div>
            {chapter.description ? (
              <Preview value={chapter.description} />
            ) : (
              <p className="text-sm text-slate-600 italic">No description provided.</p>
            )}
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachments) => (
                  <a
                    href={attachments.url}
                    target="_blank"
                    key={attachments.id}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1 ">{attachments.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Chapter Materials */}
          {materials.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-medium">Materials</h3>
                {isLocked && (
                  <p className="text-xs text-slate-500">Unlock this chapter to download materials.</p>
                )}
                {materials.map((m) => {
                  const ItemInner = (
                    <div className="flex items-center p-3 w-full bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md">
                      {m.type === "image" ? (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <File className="h-4 w-4 mr-2" />
                      )}
                      <p className="text-sm line-clamp-1">{m.name}</p>
                    </div>
                  );
                  return isLocked ? (
                    <div key={m.id}>{ItemInner}</div>
                  ) : (
                    <a key={m.id} href={m.url} target="_blank" className="hover:underline">
                      {ItemInner}
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {/* Assignments */}
          {assignments.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-medium">Assignments (PDF/Text)</h3>
                {isLocked && (
                  <p className="text-xs text-slate-500">Unlock this chapter to download assignments.</p>
                )}
                {assignments.map((a) => {
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
                  <p className="text-xs text-slate-500">Unlock this chapter to view quizzes.</p>
                )}
                {quizzes.map((q) => {
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
};

export default ChapterIdPage;
