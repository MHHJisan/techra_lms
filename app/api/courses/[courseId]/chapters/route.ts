// app/api/courses/[courseId]/chapters/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import * as z from "zod";

export const runtime = "nodejs"; // Prisma requires Node runtime
export const dynamic = "force-dynamic"; // avoid caching during writes

// Request body validation
const Body = z.object({
  title: z.string().min(1, "Title is required"),
});

/**
 * POST /api/courses/:courseId/chapters
 * Creates a new chapter for a course owned by the current user.
 */
export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse & validate payload
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title } = parsed.data;

    // If your Course.id is an INT in Prisma, cast it:
    // const courseId = Number(params.courseId);
    // if (!Number.isFinite(courseId)) {
    //   return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
    // }
    const courseId = params.courseId;

    // Ensure the course exists AND is owned by the caller.
    // Use relation to match User.clerkId to avoid mixing Clerk id with local DB user id.
    const course = await db.course.findFirst({
      where: { id: courseId, user: { clerkId } },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or not owned by you" },
        { status: 404 }
      );
    }

    // Determine next chapter position
    const last = await db.chapter.findFirst({
      where: { courseId: course.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const nextPosition = (last?.position ?? 0) + 1;

    // Create chapter
    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: course.id,
        position: nextPosition,
      },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (e: any) {
    console.error("[CHAPTERS_POST]", e);
    return NextResponse.json(
      { error: e?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
