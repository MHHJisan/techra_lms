import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";
import Image from "next/image";

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
    muxData,
    attachments,
    nextChapter,
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
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;
  const playbackId = muxData?.playbackId;

  return (
    <div className="w-full p-6 px-6">
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
        <div className="-mx-4 md:-mx-6">
          {playbackId ? (
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
              <VideoPlayer
                chapterId={params.chapterId}
                title={chapter.title}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                playbackId={playbackId}
                isLocked={isLocked}
                completeOnEnd={completeOnEnd}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <Banner variant="warning" label="Video unavailable." />
          )}
        </div>

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
            <Preview value={chapter.description!} />
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
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
