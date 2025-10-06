import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export type RoleInfo = {
  me: Awaited<ReturnType<typeof db.user.findUnique>>;
  isAdmin: boolean;
  isTeacher: boolean;
  isStaff: boolean;
  isManagement: boolean;
};

export async function getRoleInfo(userId: string | null): Promise<RoleInfo> {
  // Initial values
  let me = userId ? await db.user.findUnique({ where: { clerkId: userId } }) : null;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let email = me?.email?.toLowerCase();
  let role = (me?.role ?? "").trim().toLowerCase();

  // Fallback to Clerk info if DB is missing
  let clerkEmails: string[] = [];
  let clerkMetaRole: string | undefined = undefined;
  if (userId) {
    try {
      const cu = await clerkClient.users.getUser(userId);
      clerkEmails = (cu.emailAddresses || [])
        .map((e) => (e.emailAddress || "").toLowerCase())
        .filter(Boolean);
      const metaRole = (cu.publicMetadata?.role as string | undefined)?.trim().toLowerCase();
      clerkMetaRole = metaRole;

      // If DB user not found by clerkId, try finding by any Clerk email
      if (!me && clerkEmails.length > 0) {
        me = await db.user.findFirst({ where: { email: { in: clerkEmails } } });
        if (me) {
          email = me.email?.toLowerCase();
          role = (me.role ?? "").trim().toLowerCase();
        }
      }

      // If no DB role present, fall back to Clerk public metadata
      if (!role && metaRole) role = metaRole;
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

  const isStaff = role === "staff" || clerkMetaRole === "staff";
  const isManagement = role === "management" || role === "manager" ||
    clerkMetaRole === "management" || clerkMetaRole === "manager";

  return { me, isAdmin, isTeacher, isStaff, isManagement };
}
