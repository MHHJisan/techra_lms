import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRoleInfo } from "@/lib/auth-roles";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ManagementTeachersPage() {
  const { userId } = auth();
  if (!userId) redirect("/");
  const { isAdmin, isManagement, isStaff } = await getRoleInfo(userId);
  if (!isAdmin && !isManagement && !isStaff) redirect("/");

  const teachers = await db.user.findMany({
    where: {
      OR: [
        { role: { equals: "teacher", mode: "insensitive" } },
        { role: { equals: "instructor", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/management" className="inline-flex items-center text-sm px-3 py-1.5 rounded border hover:bg-accent">
          ← Back
        </Link>
      </div>
      <h1 className="text-xl font-semibold">Teachers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{[t.firstName, t.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="py-2 pr-4">{t.email}</td>
                <td className="py-2 pr-4 capitalize">{t.role || "user"}</td>
                <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={4}>No teachers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
