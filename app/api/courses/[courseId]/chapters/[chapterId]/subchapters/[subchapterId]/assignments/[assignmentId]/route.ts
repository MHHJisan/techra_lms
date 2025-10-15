import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; subchapterId: string; assignmentId: string } }
) {
  try {
    await (prisma as any).subChapterAssignment.delete({ where: { id: params.assignmentId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE subchapter assignment failed", err);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
