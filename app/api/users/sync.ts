import { NextResponse } from "next/server";
import { createUserFromClerk } from "@/lib/clerk-user";

export async function POST(req: Request) {
  const { clerkUserId } = await req.json();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });
  }

  await createUserFromClerk(clerkUserId);
  return NextResponse.json({ message: "User synced successfully" });
}
