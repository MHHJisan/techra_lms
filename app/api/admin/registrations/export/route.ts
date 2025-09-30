import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const course = (searchParams.get("course") || "").trim();
    const dateStart = (searchParams.get("dateStart") || "").trim();
    const dateEnd = (searchParams.get("dateEnd") || "").trim();
    const sort = (searchParams.get("sort") || "created_at").toLowerCase();
    const dir = (searchParams.get("dir") || "desc").toLowerCase();

    const filters: string[] = [];
    const values: (string | number | Date)[] = [];
    if (q) {
      values.push(`%${q}%`);
      const idx = values.length;
      filters.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR mobile ILIKE $${idx} OR address ILIKE $${idx} OR guardian_name ILIKE $${idx})`);
    }
    if (course) {
      values.push(`%${course}%`);
      const idx = values.length;
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

    const sortField = ["created_at", "name", "course_name"].includes(sort)
      ? sort
      : "created_at";
    const sortDir = dir === "asc" ? "ASC" : "DESC";

    type Row = {
      id: number;
      created_at: Date | string;
      name: string;
      father_name: string;
      mother_name: string;
      guardian_name: string;
      occupation: string;
      student_institution: string | null;
      organization_name: string | null;
      email: string;
      mobile: string;
      course_name: string;
      address: string;
      date_of_birth: string;
      nid_or_birth_cert: string;
    };

    const rows = (await db.$queryRawUnsafe<Row[]>(
      `SELECT id, created_at, name, father_name, mother_name, guardian_name, occupation, student_institution, organization_name, email, mobile, course_name, address, date_of_birth, nid_or_birth_cert
       FROM registrations
       ${whereSql}
       ORDER BY ${sortField} ${sortDir}
       LIMIT 5000`,
      ...values
    )) as Row[];

    // Build CSV
    const headers = [
      "id",
      "created_at",
      "name",
      "father_name",
      "mother_name",
      "guardian_name",
      "occupation",
      "student_institution",
      "organization_name",
      "email",
      "mobile",
      "course_name",
      "address",
      "date_of_birth",
      "nid_or_birth_cert",
    ];

    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.id,
          new Date(r.created_at).toISOString(),
          r.name,
          r.father_name,
          r.mother_name,
          r.guardian_name,
          r.occupation,
          r.student_institution ?? "",
          r.organization_name ?? "",
          r.email,
          r.mobile,
          r.course_name,
          r.address,
          r.date_of_birth,
          r.nid_or_birth_cert,
        ]
          .map(escape)
          .join(",")
      );
    }

    const csv = lines.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registrations_export_${Date.now()}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[ADMIN_REGISTRATIONS_EXPORT]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
