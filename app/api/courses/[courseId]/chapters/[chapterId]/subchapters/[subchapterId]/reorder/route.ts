import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { chapterId: string } }) {
    const user = await auth()
    const items: Array<{ id: string; position: number }> = await req.json();

    await prisma.$transaction(
        items.map((item) => prisma.subchapter.update({ where: { id: item.id }, data: { position: item.position } }))
    )
    return NextResponse.json({ok: true})
}