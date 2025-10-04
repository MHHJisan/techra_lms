// app/api/admin/applications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRoleInfo } from "@/lib/auth-roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isAdmin } = await getRoleInfo(clerkId);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const apps = await db.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    });

    return NextResponse.json(apps, { status: 200 });
  } catch (e) {
    console.error("[ADMIN_APPS_GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isAdmin } = await getRoleInfo(clerkId);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const id = String(body?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await db.application.findUnique({ where: { id }, select: { id: true, userId: true, courseId: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Also remove any purchase tying the user to the course so it disappears from dashboard
    await db.purchase.deleteMany({ where: { userId: existing.userId, courseId: existing.courseId } });
    await db.application.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[ADMIN_APPS_DELETE]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isAdmin } = await getRoleInfo(clerkId);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const id = String(body?.id || "").trim();
    const action = String(body?.action || "").toLowerCase(); // "enroll" | "unenroll"
    if (!id || (action !== "enroll" && action !== "unenroll")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const app = await db.application.findUnique({ where: { id }, select: { id: true, userId: true, courseId: true, status: true } });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    if (action === "enroll") {
      // Create purchase if not exists, then mark application approved
      await db.purchase.upsert({
        where: { userId_courseId: { userId: app.userId, courseId: app.courseId } },
        update: {},
        create: { userId: app.userId, courseId: app.courseId },
      });
      const updated = await db.application.update({ where: { id: app.id }, data: { status: "approved" } });
      return NextResponse.json(updated, { status: 200 });
    } else {
      // Remove purchase (if any) and mark application rejected
      await db.purchase.deleteMany({ where: { userId: app.userId, courseId: app.courseId } });
      const updated = await db.application.update({ where: { id: app.id }, data: { status: "rejected" } });
      return NextResponse.json(updated, { status: 200 });
    }
  } catch (e) {
    console.error("[ADMIN_APPS_PATCH]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
