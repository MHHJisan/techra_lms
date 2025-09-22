"use client";

import type { Course } from "@prisma/client";
import { DataTable } from "./data-table";
import { useCourseColumns } from "./columns";

export default function CoursesTableClient({ data }: { data: Course[] }) {
  const columns = useCourseColumns();
  return <DataTable columns={columns} data={data} />;
}
