import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_ROLES = ["user", "teacher", "admin"] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const admin = await db.user.findUnique({ where: { clerkId: userId } });
    if (!admin || !admin.email || !adminEmails.includes(admin.email)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body as { email?: string; role?: string };

    if (!email || !role) {
      return new NextResponse("Email and role are required", { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      return new NextResponse("User not found", { status: 404 });
    }

    await db.user.update({ where: { email }, data: { role } });

    return NextResponse.json({ ok: true, email, role });
  } catch (error) {
    return new NextResponse("Server error", { status: 500 });
  }
}
