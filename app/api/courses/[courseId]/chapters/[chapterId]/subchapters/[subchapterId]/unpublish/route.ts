import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const item = await prisma.subChapter.update({
      where: {
        id: params.subchapterId,
      },
      data: {
        isPublished: false,
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error("Unpublish subchapter failed", err);
    return NextResponse.json({ error: "Failed to unpublish" }, { status: 500 });
  }
}