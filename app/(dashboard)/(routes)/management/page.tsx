import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRoleInfo } from "@/lib/auth-roles";
import { db } from "@/lib/db";
import { Pie, type PieDatum } from "@/components/charts/Pie";

function toStartOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function toEndOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}
function parseYmd(s?: string | null): Date | null {
  if (!s) return null;
  // Expect YYYY-MM-DD
  const m = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  if (!m) return null;
  const [y, mo, d] = s.split("-").map((n) => parseInt(n, 10));
  if (!y || !mo || !d) return null;
  return new Date(Date.UTC(y, mo - 1, d));
}
function fmtYmd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function ManagementHomePage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");

  const { isAdmin, isManagement, isStaff } = await getRoleInfo(userId);
  if (!isAdmin && !isManagement && !isStaff) redirect("/");

  // Resolve date range (default last 30 days, UTC)
  const today = toStartOfDayUTC(new Date());
  const defaultFrom = new Date(today);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  const fromInput = parseYmd(searchParams?.from) ?? defaultFrom;
  const toInput = parseYmd(searchParams?.to) ?? today;
  const from = toStartOfDayUTC(fromInput);
  const to = toEndOfDayUTC(toInput);

  // Build a common where filter by createdAt
  const dateWhere = { createdAt: { gte: from, lte: to } } as const;

  // Load purchases with course info for student counts and revenue
  const purchases = await db.purchase.findMany({
    where: dateWhere,
    include: { course: { select: { id: true, title: true, price: true } } },
  });

  // Load applications per course (any status)
  const applications = await db.application.findMany({
    where: dateWhere,
    include: { course: { select: { id: true, title: true } } },
  });

  // Aggregate students (purchase count) and revenue by course
  const studentCountByCourse = new Map<string, { title: string; count: number }>();
  const revenueByCourse = new Map<string, { title: string; amount: number }>();

  for (const p of purchases) {
    const id = p.course.id;
    const title = p.course.title;
    const price = Number(p.course.price ?? 0);
    studentCountByCourse.set(id, {
      title,
      count: (studentCountByCourse.get(id)?.count ?? 0) + 1,
    });
    revenueByCourse.set(id, {
      title,
      amount: (revenueByCourse.get(id)?.amount ?? 0) + price,
    });
  }

  // Aggregate applications by course
  const applicationsByCourse = new Map<string, { title: string; count: number }>();
  for (const a of applications) {
    const id = a.course.id;
    const title = a.course.title;
    applicationsByCourse.set(id, {
      title,
      count: (applicationsByCourse.get(id)?.count ?? 0) + 1,
    });
  }

  const toPieData = (
    m: Map<string, { title: string; count?: number; amount?: number }>,
    kind: "count" | "amount"
  ): PieDatum[] => {
    const arr: PieDatum[] = [];
    for (const [, v] of m) {
      const value = kind === "count" ? (v.count ?? 0) : (v.amount ?? 0);
      if (value > 0) arr.push({ label: v.title, value });
    }
    arr.sort((a, b) => b.value - a.value);
    return arr;
  };

  const studentsPie = toPieData(studentCountByCourse, "count");
  const revenuePie = toPieData(revenueByCourse, "amount");
  const applicationsPie = toPieData(applicationsByCourse, "count");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Management Panel</h1>
          <p className="text-sm text-muted-foreground">Overview of students, revenue, and applications by course.</p>
        </div>
        {/* Date range filter form (GET) */}
        <form className="flex items-end gap-2" action="/management" method="get">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              name="from"
              defaultValue={fmtYmd(from)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              name="to"
              defaultValue={fmtYmd(to)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button type="submit" className="border rounded px-3 py-2 text-sm hover:bg-accent">Apply</button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Students by Course</h2>
          <Pie data={studentsPie} donut size={220} radius={90} />
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Revenue by Course</h2>
          <Pie data={revenuePie} donut size={220} radius={90} />
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Applications by Course</h2>
          <Pie data={applicationsPie} donut size={220} radius={90} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link className="border rounded p-4 hover:bg-accent" href="/management/teachers">
            <div className="font-medium">Teachers</div>
            <div className="text-sm text-muted-foreground">List of teachers</div>
          </Link>
          <Link className="border rounded p-4 hover:bg-accent" href="/management/students">
            <div className="font-medium">Students</div>
            <div className="text-sm text-muted-foreground">List of students</div>
          </Link>
          <Link className="border rounded p-4 hover:bg-accent" href="/management/enrollments">
            <div className="font-medium">Enrollments</div>
            <div className="text-sm text-muted-foreground">Which student enrolled in which course</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
