import { ReactNode } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = auth();
  if (!userId) return redirect("/");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let isAdmin =
    user?.role === "admin" ||
    (!!user?.email && adminEmails.includes(user.email.toLowerCase()));

  // Also check all Clerk email addresses to avoid DB sync gaps
  if (!isAdmin) {
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      const allEmails = (clerkUser.emailAddresses || [])
        .map((e) => e.emailAddress?.toLowerCase())
        .filter(Boolean) as string[];
      isAdmin = allEmails.some((email) => adminEmails.includes(email));
    } catch {}
  }

  if (!isAdmin) return redirect("/");

  return <>{children}</>;
}
