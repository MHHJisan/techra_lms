import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import AdminUserActions from "@/components/admin/AdminUserActions";
// import { any } from "zod";

function pickDisplayEmail(
  cu: any,
  fallback: string | null | undefined
): string {
  const addresses = (cu?.emailAddresses || []) as Array<{
    emailAddress?: string;
    verification?: { status?: string } | null;
  }>;
  // Prefer verified, non-local.invalid
  const verified = addresses.find(
    (e) =>
      e.emailAddress &&
      e.verification?.status === "verified" &&
      !e.emailAddress.endsWith("@local.invalid")
  )?.emailAddress;
  if (verified) return verified;
  // Otherwise any non-local.invalid
  const nonLocal = addresses.find(
    (e) => e.emailAddress && !e.emailAddress.endsWith("@local.invalid")
  )?.emailAddress;
  if (nonLocal) return nonLocal;
  // Fallback to first address or DB fallback
  return (
    addresses.find((e) => !!e.emailAddress)?.emailAddress || fallback || ""
  );
}

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      createdAt: true,
      role: true,
    },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      let displayEmail = u.email || "";
      try {
        if (u.clerkId) {
          const cu = await clerkClient.users.getUser(u.clerkId);
          displayEmail = pickDisplayEmail(cu, displayEmail);
        }
      } catch {}
      return { ...u, displayEmail };
    })
  );

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">All Users</h1>
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"}
                </td>
                <td className="p-3">{u.displayEmail || "—"}</td>
                <td className="p-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <AdminUserActions
                    userId={u.id}
                    email={u.displayEmail}
                    currentRole={u.role}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={4}>
                  No Users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
