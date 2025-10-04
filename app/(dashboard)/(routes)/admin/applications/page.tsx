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
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[14%]">Student</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[18%]">Email</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[24%]">Course</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[10%]">Payment</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[14%]">bKash Number</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[10%]">Status</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[14%]">Submitted</th>
              <th className="text-left px-3 py-2 align-middle whitespace-nowrap w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => {
              const name = [a.user.firstName, a.user.lastName].filter(Boolean).join(" ") || "—";
              return (
                <tr key={a.id} className="border-t align-middle">
                  <td className="px-3 py-2 align-middle whitespace-nowrap">{name}</td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span className="block truncate" title={a.user.email}>{a.user.email}</span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <span className="block truncate" title={a.course.title}>{a.course.title}</span>
                  </td>
                  <td className="px-3 py-2 align-middle capitalize whitespace-nowrap">{a.paymentMethod}</td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">{a.bkashNumber || "—"}</td>
                  <td className="px-3 py-2 align-middle capitalize whitespace-nowrap">{a.status}</td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 align-middle">
                    <ApplicationActions id={a.id} status={a.status} />
                  </td>
                </tr>
              );
            })}
            {apps.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={8}>
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
