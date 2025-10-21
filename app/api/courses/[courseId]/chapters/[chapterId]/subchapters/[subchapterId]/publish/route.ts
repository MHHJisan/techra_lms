import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const updated = await prisma.subChapter.update({
      where: {
        id: params.subchapterId,
        chapterId: params.chapterId,
      },
      data: { isPublished: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Publish subchapter failed", err);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}