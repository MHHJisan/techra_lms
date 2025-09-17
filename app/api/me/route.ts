import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createUserFromClerk } from "@/lib/clerk-user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ role: null, isAdmin: false }), {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Ensure user exists in our DB; if not, sync from Clerk
    let user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      try {
        await createUserFromClerk(userId);
        user = await db.user.findUnique({ where: { clerkId: userId } });
      } catch {}
    }

    // Get all emails from Clerk (fallback and for matching)
    let allEmails: string[] = [];
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      allEmails = (clerkUser.emailAddresses || [])
        .map((e) => e.emailAddress?.toLowerCase())
        .filter(Boolean) as string[];
    } catch {}

    // Include DB email if present
    if (user?.email) {
      const lower = user.email.toLowerCase();
      if (!allEmails.includes(lower)) allEmails.push(lower);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin =
      user?.role === "admin" ||
      allEmails.some((email) => adminEmails.includes(email));

    return new NextResponse(
      JSON.stringify({ role: user?.role ?? null, isAdmin }),
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to load user role" }),
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
