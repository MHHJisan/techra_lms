// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import * as z from "zod";

export const runtime = "nodejs"; // Prisma needs Node runtime

const Body = z.object({
  title: z.string().min(1, "Title is required"),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = Body.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title } = parsed.data;

    // 🔑 Map Clerk user -> local DB user
    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) {
      // Option A: create a local user row here
      // const dbUser = await db.user.create({ data: { clerkId, email: ..., role: "teacher" } });
      return NextResponse.json(
        { error: "User not provisioned in database" },
        { status: 403 }
      );
    }

    // ✅ Use local user id as FK (most common schema)
    const course = await db.course.create({
      data: {
        title,
        userId: dbUser.id, // <-- IMPORTANT: local User.id, not Clerk id
      },
      select: { id: true },
    });

    return NextResponse.json({ id: course.id }, { status: 201 });
  } catch (e: any) {
    console.error("[COURSES_POST]", e);
    return NextResponse.json(
      { error: e?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
