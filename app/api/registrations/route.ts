import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const RegistrationSchema = z.object({
  name: z.string().min(1),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  address: z.string().min(1),
  dateOfBirth: z.string().min(1),
  nidOrBirthCert: z.string().min(1),
  guardianName: z.string().min(1),
  occupation: z.enum(["Student", "Job Holder", "Housewife"]),
  studentInstitution: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.string().email(),
  mobile: z
    .string()
    .regex(/^(\+?88)?01[3-9]\d{8}$/),
  courseName: z.string().min(1),
}).superRefine((val, ctx) => {
  // Mirror client-side conditional requirements
  if (val.occupation === "Student") {
    if (!val.studentInstitution || !val.studentInstitution.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["studentInstitution"], message: "School/College/University is required" });
    }
  }
  if (val.occupation === "Job Holder") {
    if (!val.organizationName || !val.organizationName.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["organizationName"], message: "Organization's Name is required" });
    }
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    // Persist to Supabase (Postgres) using raw SQL to avoid schema changes/migrations
    // 1) Ensure table exists (id bigserial PK for simplicity)
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
        student_institution TEXT NULL,
        organization_name TEXT NULL,
        email TEXT NOT NULL,
        mobile TEXT NOT NULL,
        course_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const d = parsed.data;
    // 2) Insert row (parameterized to avoid SQL injection)
    await db.$executeRaw`
      INSERT INTO registrations (
        name, father_name, mother_name, address, date_of_birth,
        nid_or_birth_cert, guardian_name, occupation, student_institution, organization_name,
        email, mobile, course_name
      ) VALUES (
        ${d.name}, ${d.fatherName}, ${d.motherName}, ${d.address}, ${d.dateOfBirth},
        ${d.nidOrBirthCert}, ${d.guardianName}, ${d.occupation}, ${d.studentInstitution ?? null}, ${d.organizationName ?? null},
        ${d.email}, ${d.mobile}, ${d.courseName}
      )
    `;

    return NextResponse.json({ success: true, stored: true }, { status: 201 });
  } catch (e) {
    console.error("[REGISTRATIONS_POST]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
