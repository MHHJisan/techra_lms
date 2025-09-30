import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminRegistrationViewPage({ params }: PageProps) {
  // Ensure table exists (first-time safety)
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS registrations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      address TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      nid_or_birth_cert TEXT NOT NULL,
      guardian_name TEXT NOT NULL,
      occupation TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      course_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Upgrade legacy table schema if missing new columns
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS student_institution TEXT NULL;`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS organization_name TEXT NULL;`
  );

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    notFound();
  }

  type Row = {
    id: number;
    created_at: Date | string;
    name: string;
    father_name: string;
    mother_name: string;
    address: string;
    date_of_birth: string;
    nid_or_birth_cert: string;
    guardian_name: string;
    occupation: string;
    student_institution: string | null;
    organization_name: string | null;
    email: string;
    mobile: string;
    course_name: string;
  } | null;

  const rows = (await db.$queryRawUnsafe<Row[]>(
    `SELECT id, created_at, name, father_name, mother_name, address, date_of_birth,
            nid_or_birth_cert, guardian_name, occupation, student_institution, organization_name,
            email, mobile, course_name
     FROM registrations
     WHERE id = $1
     LIMIT 1`,
    id
  )) as Row[];

  const r = rows?.[0];
  if (!r) {
    notFound();
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-4">
        <a href="/admin/registrations" className="text-slate-700 hover:underline">← Back to list</a>
      </div>
      <h1 className="text-2xl font-semibold mb-6">Registration #{r!.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium mb-3">Student</h2>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Name</dt><dd className="col-span-2">{r!.name}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Father</dt><dd className="col-span-2">{r!.father_name}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Mother</dt><dd className="col-span-2">{r!.mother_name}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Guardian</dt><dd className="col-span-2">{r!.guardian_name}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Occupation</dt><dd className="col-span-2">{r!.occupation}</dd></div>
            {r!.student_institution && (
              <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Institution</dt><dd className="col-span-2">{r!.student_institution}</dd></div>
            )}
            {r!.organization_name && (
              <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Organization</dt><dd className="col-span-2">{r!.organization_name}</dd></div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium mb-3">Contact</h2>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Email</dt><dd className="col-span-2">{r!.email}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Mobile</dt><dd className="col-span-2">{r!.mobile}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Address</dt><dd className="col-span-2 whitespace-pre-wrap break-words">{r!.address}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium mb-3">Course & ID</h2>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Course</dt><dd className="col-span-2">{r!.course_name}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">NID/Birth Cert</dt><dd className="col-span-2">{r!.nid_or_birth_cert}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium mb-3">Meta</h2>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">Created</dt><dd className="col-span-2">{new Date(r!.created_at).toLocaleString()}</dd></div>
            <div className="grid grid-cols-3 gap-2"><dt className="text-slate-500">DOB</dt><dd className="col-span-2">{r!.date_of_birth}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
