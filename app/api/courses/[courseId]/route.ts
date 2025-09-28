// app/api/courses/[courseId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import * as z from "zod";
import { getRoleInfo } from "@/lib/auth-roles";

export const runtime = "nodejs"; // Prisma needs Node runtime
export const dynamic = "force-dynamic"; // avoid caching when updating

// Mux has been removed; courses no longer manage remote video assets here.

// ---------- Validation ----------
const PatchSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  // Adjust price type to your schema: number or string.
  price: z.union([z.number(), z.string()]).nullable().optional(),
  isPublished: z.boolean().optional(), // include only if you allow toggling publish here
});

// ---------- PATCH: update a course the caller owns ----------
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the course exists AND is owned by the caller (via relation)
    const existing = await db.course.findFirst({
      where: { id: params.courseId, user: { clerkId } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Course not found or not owned by you" },
        { status: 404 }
      );
    }

    // Validate and pick only allowed fields
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Optional: normalize price if string
    if (typeof data.price === "string" && data.price.trim() !== "") {
      const n = Number(data.price);
      data.price = Number.isFinite(n) ? n : null;
    }

    // If nothing to update, short-circuit
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const updated = await db.course.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        price: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e: unknown) {
    console.error("[COURSE_PATCH]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------- DELETE: delete a course the caller owns ----------
export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine if caller is admin; admins can delete any course
    const { isAdmin } = await getRoleInfo(clerkId);

    // Load course with children; enforce ownership only for non-admins
    const course = await db.course.findFirst({
      where: isAdmin ? { id: params.courseId } : { id: params.courseId, user: { clerkId } },
      include: { chapters: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // No Mux cleanup necessary.

    // Finally, delete the course (ensure your schema cascades chapters/attachments as desired)
    const deleted = await db.course.delete({
      where: { id: course.id },
      select: { id: true },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (e: unknown) {
    console.error("[COURSE_DELETE]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
