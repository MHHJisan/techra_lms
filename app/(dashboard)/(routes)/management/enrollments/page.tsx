import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRoleInfo } from "@/lib/auth-roles";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ManagementEnrollmentsPage() {
  const { userId } = auth();
  if (!userId) redirect("/");
  const { isAdmin, isManagement, isStaff } = await getRoleInfo(userId);
  if (!isAdmin && !isManagement && !isStaff) redirect("/");

  const purchases = await db.purchase.findMany({
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true } },
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
      <h1 className="text-xl font-semibold">Enrollments</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Student</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Course</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="py-2 pr-4">{p.user.email}</td>
                <td className="py-2 pr-4">{p.course.title}</td>
                <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={4}>No enrollments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
