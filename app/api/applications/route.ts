// app/api/applications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as z from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  courseId: z.string().min(1),
  paymentMethod: z.enum(["cash", "bkash"]).default("bkash"),
});

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = String(searchParams.get("courseId") || "").trim();
    if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const purchase = await db.purchase.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { id: true },
    });

    const app = await db.application.findFirst({
      where: { userId: user.id, courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });

    return NextResponse.json(
      { hasPurchase: !!purchase, applicationStatus: app?.status ?? null, applicationId: app?.id ?? null },
      { status: 200 }
    );
  } catch (e) {
    console.error("[APPLICATIONS_GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { courseId, paymentMethod } = parsed.data;

    // Find our internal user
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const created = await db.application.create({
      data: {
        userId: user.id,
        courseId: course.id,
        paymentMethod,
        status: "pending",
      },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("[APPLICATIONS_POST]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
