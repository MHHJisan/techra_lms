import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Admin check via allowlist
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const me = await db.user.findUnique({ where: { clerkId: userId } });
    const myEmail = me?.email?.toLowerCase();
    if (!myEmail || !adminEmails.includes(myEmail)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { id: true, isPublished: true },
    });
    if (!course) return new NextResponse("Not found", { status: 404 });

    const updated = await db.course.update({
      where: { id: course.id },
      data: { isPublished: !course.isPublished },
      select: { id: true, isPublished: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[ADMIN_TOGGLE_PUBLISH]", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
