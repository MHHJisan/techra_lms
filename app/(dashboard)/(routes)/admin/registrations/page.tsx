import { db } from "@/lib/db";
import RegistrationActions from "./_components/RegistrationActions";

export const dynamic = "force-dynamic"; // ensure fresh fetch

// Define a type for rows returned from the raw query
interface RegistrationRow {
  id: number;
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
  created_at: Date | string;
}

interface PageProps {
  searchParams?: {
    q?: string;
    course?: string;
    page?: string;
    sort?: string;
    dir?: string;
    dateStart?: string;
    dateEnd?: string;
  };
}

export default async function AdminRegistrationsPage({ searchParams }: PageProps) {
  // Ensure the table exists to avoid errors on first load
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
  // Upgrade legacy table schema if it existed without the expected columns
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS father_name TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mother_name TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS date_of_birth TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS nid_or_birth_cert TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS guardian_name TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS occupation TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mobile TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS course_name TEXT NOT NULL DEFAULT ''`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS student_institution TEXT NULL;`
  );
  await db.$executeRawUnsafe(
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS organization_name TEXT NULL;`
  );

  const q = (searchParams?.q || "").trim();
  const course = (searchParams?.course || "").trim();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const sort = (searchParams?.sort || "created_at").toLowerCase();
  const dir = (searchParams?.dir || "desc").toLowerCase();
  const dateStart = (searchParams?.dateStart || "").trim();
  const dateEnd = (searchParams?.dateEnd || "").trim();
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build WHERE clause dynamically and parameterize values with positional placeholders
  const filters: string[] = [];
  const values: (string | number | Date)[] = [];
  if (q) {
    values.push(`%${q}%`);
    const idx = values.length; // -> $1 (or next)
    filters.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR mobile ILIKE $${idx} OR address ILIKE $${idx} OR guardian_name ILIKE $${idx})`);
  }
  if (course) {
    values.push(`%${course}%`);
    const idx = values.length; // -> next $n
    filters.push(`(course_name ILIKE $${idx})`);
  }
  if (dateStart) {
    values.push(dateStart);
    const idx = values.length;
    filters.push(`(created_at >= $${idx})`);
  }
  if (dateEnd) {
    values.push(dateEnd);
    const idx = values.length;
    filters.push(`(created_at <= $${idx})`);
  }
  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // Whitelist sort field and direction
  const sortField = ["created_at", "name", "course_name"].includes(sort)
    ? sort
    : "created_at";
  const sortDir = dir === "asc" ? "ASC" : "DESC";

  // Total count
  type CountRow = { total: number };
  const countRows = (await db.$queryRawUnsafe<CountRow[]>(
    `SELECT count(*)::int as total FROM registrations ${whereSql}`,
    ...values
  )) as CountRow[];
  const total = countRows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Page rows
  const rows = (await db.$queryRawUnsafe<RegistrationRow[]>(
    `SELECT id, name, father_name, mother_name, address, date_of_birth,
            nid_or_birth_cert, guardian_name, occupation, student_institution, organization_name,
            email, mobile, course_name, created_at
     FROM registrations
     ${whereSql}
     ORDER BY ${sortField} ${sortDir}
     LIMIT ${pageSize} OFFSET ${offset}`,
    ...values
  )) as RegistrationRow[];

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Registered</h1>

      <form className="mb-3 flex flex-wrap gap-1.5" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name/email/mobile/address/guardian"
          className="h-8 w-full md:w-80 rounded-md border px-2 text-xs"
        />
        <input
          type="text"
          name="course"
          defaultValue={course}
          placeholder="Filter by course name"
          className="h-8 w-full md:w-64 rounded-md border px-2 text-xs"
        />
        <input
          type="date"
          name="dateStart"
          defaultValue={dateStart}
          className="h-8 w-full md:w-48 rounded-md border px-2 text-xs"
          aria-label="Start date"
        />
        <input
          type="date"
          name="dateEnd"
          defaultValue={dateEnd}
          className="h-8 w-full md:w-48 rounded-md border px-2 text-xs"
          aria-label="End date"
        />
        <select
          name="sort"
          defaultValue={sortField}
          className="h-8 w-full md:w-48 rounded-md border px-2 text-xs"
        >
          <option value="created_at">Sort by Created</option>
          <option value="name">Sort by Name</option>
          <option value="course_name">Sort by Course</option>
        </select>
        <select
          name="dir"
          defaultValue={sortDir.toLowerCase()}
          className="h-8 w-full md:w-32 rounded-md border px-2 text-xs"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button className="h-8 inline-flex items-center rounded-md bg-slate-900 text-white px-3 text-xs font-medium hover:bg-slate-800" type="submit">
          Apply
        </button>
        <a
          className="h-8 inline-flex items-center rounded-md border px-3 text-xs hover:bg-slate-50"
          href={`/api/admin/registrations/export?${new URLSearchParams({ q, course, dateStart, dateEnd, sort: sortField, dir: sortDir.toLowerCase() }).toString()}`}
          target="_blank"
          rel="noreferrer"
        >
          Export CSV
        </a>
      </form>
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 whitespace-nowrap">#</th>
              <th className="text-left p-2 whitespace-nowrap">Created</th>
              <th className="text-left p-2 whitespace-nowrap">Name</th>
              <th className="text-left p-2 whitespace-nowrap">Father</th>
              <th className="text-left p-2 whitespace-nowrap">Mother</th>
              <th className="text-left p-2 whitespace-nowrap">Guardian</th>
              <th className="text-left p-2 whitespace-nowrap">Occupation</th>
              <th className="text-left p-2 whitespace-nowrap">Institution</th>
              <th className="text-left p-2 whitespace-nowrap">Organization</th>
              <th className="text-left p-2 whitespace-nowrap">Email</th>
              <th className="text-left p-2 whitespace-nowrap">Mobile</th>
              <th className="text-left p-2 whitespace-nowrap">Course</th>
              <th className="text-left p-2">Address</th>
              <th className="text-left p-2 whitespace-nowrap">DOB</th>
              <th className="text-left p-2 whitespace-nowrap">NID/Birth Cert</th>
              <th className="text-left p-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-2 text-slate-500">{r.id}</td>
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2 font-medium">{r.name}</td>
                <td className="p-2">{r.father_name}</td>
                <td className="p-2">{r.mother_name}</td>
                <td className="p-2">{r.guardian_name}</td>
                <td className="p-2">{r.occupation}</td>
                <td className="p-2">{r.student_institution || "—"}</td>
                <td className="p-2">{r.organization_name || "—"}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.mobile}</td>
                <td className="p-2">{r.course_name}</td>
                <td className="p-2 max-w-[320px] whitespace-pre-wrap break-words">{r.address}</td>
                <td className="p-2">{r.date_of_birth}</td>
                <td className="p-2">{r.nid_or_birth_cert}</td>
                <td className="p-2"><RegistrationActions id={r.id} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={13}>
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {rows.length} of {total} result{total === 1 ? "" : "s"}. Page {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <a
              className="rounded-md border px-3 py-1.5 hover:bg-slate-50"
              href={`?${new URLSearchParams({ q, course, page: String(page - 1) }).toString()}`}
            >
              Previous
            </a>
          )}
          {page < totalPages && (
            <a
              className="rounded-md border px-3 py-1.5 hover:bg-slate-50"
              href={`?${new URLSearchParams({ q, course, page: String(page + 1) }).toString()}`}
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
