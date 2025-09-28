import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export type RoleInfo = {
  me: Awaited<ReturnType<typeof db.user.findUnique>>;
  isAdmin: boolean;
  isTeacher: boolean;
};

export async function getRoleInfo(userId: string | null): Promise<RoleInfo> {
  const me = userId ? await db.user.findUnique({ where: { clerkId: userId } }) : null;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = me?.email?.toLowerCase();
  let role = (me?.role ?? "").toLowerCase();

  // Fallback to Clerk info if DB is missing
  let clerkEmails: string[] = [];
  let clerkMetaRole: string | undefined = undefined;
  if (userId) {
    try {
      const cu = await clerkClient.users.getUser(userId);
      clerkEmails = cu.emailAddresses
        ?.map((e) => e.emailAddress?.toLowerCase())
        .filter(Boolean) as string[];
      const metaRole = (cu.publicMetadata?.role as string | undefined)?.toLowerCase();
      if (!role && metaRole) role = metaRole;
      if (!me?.email) {
        // No DB email, attempt first Clerk email
        // Note: we do not write to DB here to keep this helper pure
      }
      clerkMetaRole = metaRole;
    } catch {
      // ignore clerk fallback errors
    }
  }

  const isAdminFromRole = role === "admin" || role === "superadmin";
  const isAdminFromEmails = (!!email && adminEmails.includes(email)) ||
    clerkEmails.some((e) => adminEmails.includes(e));
  const isAdmin = isAdminFromRole || isAdminFromEmails;

  const isTeacher = role === "teacher" || role === "instructor" ||
    (clerkMetaRole === "teacher" || clerkMetaRole === "instructor");

  return { me, isAdmin, isTeacher };
}
