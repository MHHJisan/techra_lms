import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const list: Array<{ id: string; position: number }> = body.list || [];

    if (!Array.isArray(list)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      list.map((item) =>
        prisma.subChapter.update({
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
