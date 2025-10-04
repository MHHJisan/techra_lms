import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRoleInfo } from "@/lib/auth-roles";
import ApplicationActions from "@/components/admin/ApplicationActions";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const { userId } = auth();
  if (!userId) return redirect("/");

  const { isAdmin } = await getRoleInfo(userId);
  if (!isAdmin) return redirect("/");

  const apps = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      course: { select: { title: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="text-slate-600 text-sm mt-1">All enrollment applications submitted by students</p>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Student</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Course</th>
              <th className="text-left px-3 py-2">Payment</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Submitted</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => {
              const name = [a.user.firstName, a.user.lastName].filter(Boolean).join(" ") || "—";
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">{a.user.email}</td>
                  <td className="px-3 py-2">{a.course.title}</td>
                  <td className="px-3 py-2 capitalize">{a.paymentMethod}</td>
                  <td className="px-3 py-2 capitalize">{a.status}</td>
                  <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <ApplicationActions id={a.id} status={a.status} />
                  </td>
                </tr>
              );
            })}
            {apps.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                  No applications yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
