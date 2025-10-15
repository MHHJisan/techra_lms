import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const { userId } = await auth();
    const item = await (prisma as any).subChapter.update({
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