import { db } from "@/lib/db";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminTeachersPage() {
  const teachers = await db.user.findMany({
    where: { role: "teacher" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      createdAt: true,
      role: true,
    },
  });

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Teachers</h1>
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
            {teachers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <AdminUserActions
                    userId={u.id}
                    email={u.email}
                    currentRole={u.role}
                  />
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={4}>
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
