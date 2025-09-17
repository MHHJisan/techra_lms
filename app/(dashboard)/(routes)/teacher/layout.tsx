import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = auth();
  if (!userId) return redirect("/");
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "teacher") return redirect("/");
  return <>{children}</>;
}
