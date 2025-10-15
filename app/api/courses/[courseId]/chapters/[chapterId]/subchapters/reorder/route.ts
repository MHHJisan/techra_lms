import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { courseId: string; chapterId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const list: Array<{ id: string; position: number }> = body.list || [];

    if (!Array.isArray(list)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      list.map((item) =>
        (prisma as any).subChapter.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT subchapters reorder failed", err);
    return NextResponse.json({ error: "Failed to reorder subchapters" }, { status: 500 });
  }
}
