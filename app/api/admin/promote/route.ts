import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const { email } = body as { email?: string };
    if (!email) return new NextResponse("Email required", { status: 400 });

    await db.user.update({ where: { email }, data: { role: "teacher" } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return new NextResponse("Server error", { status: 500 });
  }
}
