import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string } }
) {
  try {
    const items = await (prisma as any).subChapterAssignment.findMany({
      where: { subchapterId: params.subchapterId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET subchapter assignments failed", err);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
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

    const payload: any = { subchapterId: params.subchapterId, url };
    if (name) payload.name = name;
    const created = await (prisma as any).subChapterAssignment.create({ data: payload });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST subchapter assignment failed", err);
    return NextResponse.json({ error: "Failed to add assignment" }, { status: 500 });
  }
}
