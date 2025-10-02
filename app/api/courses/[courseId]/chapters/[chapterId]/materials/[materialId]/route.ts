import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string; chapterId: string; materialId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const courseOwner = await db.course.findFirst({
      where: { id: params.courseId, user: { clerkId: userId } },
    });
    if (!courseOwner) return new NextResponse("Unauthorized", { status: 401 });

    const material = await db.chapterMaterial.findFirst({
      where: { id: params.materialId, chapterId: params.chapterId },
    });
    if (!material) return new NextResponse("Not found", { status: 404 });

    const deleted = await db.chapterMaterial.delete({ where: { id: params.materialId } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("[CHAPTER_MATERIAL_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
