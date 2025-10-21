import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string; quizId: string } }
) {
  try {
    await prisma.subChapterQuiz.delete({ where: { id: params.quizId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE subchapter quiz failed", err);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
