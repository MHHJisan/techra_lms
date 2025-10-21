import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const items = await prisma.subChapterQuiz.findMany({
      where: { subchapterId: params.subchapterId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET subchapter quizzes failed", err);
    return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const body = await req.json();
    const name: string | undefined = body.name;
    const url: string = body.url;
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const created = await prisma.subChapterQuiz.create({
      data: { subchapterId: params.subchapterId, url, name: name ?? "" },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST subchapter quiz failed", err);
    return NextResponse.json({ error: "Failed to add quiz" }, { status: 500 });
  }
}
