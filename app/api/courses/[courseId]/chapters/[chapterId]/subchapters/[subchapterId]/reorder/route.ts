import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const items: Array<{ id: string; position: number }> = await req.json();

    await prisma.$transaction(
        items.map((item) => prisma.subChapter.update({ where: { id: item.id }, data: { position: item.position } }))
    )
    return NextResponse.json({ok: true})
}