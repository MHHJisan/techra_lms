// app/api/courses/[courseId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Mux } from "@mux/mux-node";
import * as z from "zod";

export const runtime = "nodejs"; // Prisma needs Node runtime
export const dynamic = "force-dynamic"; // avoid caching when updating

// ---------- Mux (optional) ----------
const muxTokenId = process.env.MUX_TOKEN_ID;
const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

// Initialize only if tokens exist; otherwise skip remote deletes gracefully.
const mux =
  muxTokenId && muxTokenSecret
    ? new Mux({ tokenId: muxTokenId, tokenSecret: muxTokenSecret })
    : null;
const video = mux?.video;

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
  } catch (e: any) {
    console.error("[COURSE_PATCH]", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------- DELETE: delete a course the caller owns (+ Mux cleanup) ----------
export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load course with children to verify ownership and collect Mux assets
    const course = await db.course.findFirst({
      where: { id: params.courseId, user: { clerkId } }, // relation filter
      include: {
        chapters: {
          include: { muxData: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or not owned by you" },
        { status: 404 }
      );
    }

    // Delete remote Mux assets (best-effort), if credentials are available
    if (video) {
      for (const ch of course.chapters) {
        const assetId = ch.muxData?.assetId;
        if (!assetId) continue;
        try {
          await video.assets.delete(assetId);
        } catch (err: any) {
          // Ignore 404s or auth errors, but log for observability
          console.warn(
            `[MUX] Failed to delete asset ${assetId}:`,
            err?.message || err
          );
        }
      }
    } else {
      console.warn(
        "[MUX] Skipping remote asset deletion: missing MUX_TOKEN_ID/SECRET"
      );
    }

    // Remove Mux metadata rows (if you keep them)
    await db.muxData.deleteMany({
      where: { chapterId: { in: course.chapters.map((c) => c.id) } },
    });

    // Finally, delete the course (ensure your schema cascades chapters/attachments as desired)
    const deleted = await db.course.delete({
      where: { id: course.id },
      select: { id: true },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (e: any) {
    console.error("[COURSE_DELETE]", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
