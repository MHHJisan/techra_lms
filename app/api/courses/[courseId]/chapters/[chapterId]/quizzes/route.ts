import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { url, name }: { url: string; name?: string } = await req.json();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const courseOwner = await db.course.findFirst({
      where: { id: params.courseId, user: { clerkId: userId } },
    });
    if (!courseOwner) return new NextResponse("Unauthorized", { status: 401 });

    const chapter = await db.chapter.findFirst({
      where: { id: params.chapterId, courseId: params.courseId },
    });
    if (!chapter) return new NextResponse("Chapter not found", { status: 404 });

    const quiz = await db.chapterQuiz.create({
      data: {
        url,
        name: name || url.split("/").pop() || "quiz",
        chapterId: params.chapterId,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("[CHAPTER_QUIZZES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
