import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRoleInfo } from "@/lib/auth-roles";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ManagementStudentsPage() {
  const { userId } = auth();
  if (!userId) redirect("/");
  const { isAdmin, isManagement, isStaff } = await getRoleInfo(userId);
  if (!isAdmin && !isManagement && !isStaff) redirect("/");

  const students = await db.user.findMany({
    where: {
      OR: [
        { role: { equals: "user", mode: "insensitive" } },
        { purchases: { some: {} } },
      ],
    },
    include: { purchases: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/management" className="inline-flex items-center text-sm px-3 py-1.5 rounded border hover:bg-accent">
          ← Back
        </Link>
      </div>
      <h1 className="text-xl font-semibold">Students</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Enrollments</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{[s.firstName, s.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="py-2 pr-4">{s.email}</td>
                <td className="py-2 pr-4">{s.purchases.length}</td>
                <td className="py-2 pr-4">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={4}>No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
