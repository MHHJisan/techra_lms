import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { url, name }: { url: string; name?: string } = await req.json();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Ensure the user owns the course
    const courseOwner = await db.course.findFirst({
      where: { id: params.courseId, user: { clerkId: userId } },
    });
    if (!courseOwner) return new NextResponse("Unauthorized", { status: 401 });

    // Ensure chapter belongs to course
    const chapter = await db.chapter.findFirst({
      where: { id: params.chapterId, courseId: params.courseId },
    });
    if (!chapter) return new NextResponse("Chapter not found", { status: 404 });

    const material = await db.chapterMaterial.create({
      data: {
        url,
        name: name || url.split("/").pop() || "material",
        type: inferTypeFromUrl(url),
        chapterId: params.chapterId,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("[CHAPTER_MATERIALS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function inferTypeFromUrl(url: string): string | null {
  try {
    const lower = url.toLowerCase();
    if (lower.match(/\.(png|jpe?g|webp|gif|bmp|svg)$/)) return "image";
    if (lower.match(/\.(pdf)$/)) return "pdf";
    if (lower.match(/\.(pptx?|key|odp)$/)) return "slide";
    return null;
  } catch {
    return null;
  }
}
