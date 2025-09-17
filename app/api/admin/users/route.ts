import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function isAdminUser(userId: string) {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const admin = await db.user.findUnique({ where: { clerkId: userId } });
  if (admin?.role === "admin") return true;
  if (admin?.email && adminEmails.includes(admin.email.toLowerCase()))
    return true;
  try {
    const cu = await clerkClient.users.getUser(userId);
    const emails = (cu.emailAddresses || [])
      .map((e) => e.emailAddress?.toLowerCase())
      .filter(Boolean) as string[];
    return emails.some((e) => adminEmails.includes(e));
  } catch {
    return false;
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const ok = await isAdminUser(userId);
    if (!ok) return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const { id, email, role } = body as {
      id?: string;
      email?: string;
      role?: string;
    };
    if (!role || (!id && !email))
      return new NextResponse("Missing fields", { status: 400 });

    const where = id ? { id } : { email: email as string };
    await db.user.update({ where, data: { role } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const ok = await isAdminUser(userId);
    if (!ok) return new NextResponse("Forbidden", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    if (!id && !email)
      return new NextResponse("Missing id or email", { status: 400 });

    const where = id ? { id } : { email: email as string };
    await db.user.delete({ where });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return new NextResponse("Server error", { status: 500 });
  }
}
