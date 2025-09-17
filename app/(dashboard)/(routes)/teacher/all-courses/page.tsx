// app/(teacher)/teacher/all-courses/page.tsx
// import AllCoursesView from "@/app/components/all-courses-view";

import { getCourses } from "@/actions/get-courses";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AllCoursesView from "@/components/all-courses-view";

export default async function TeacherAllCoursesPage() {
  const courses = await getCourses({});
  return (
    <AllCoursesView
      courses={courses}
      heading="All Courses"
      action={
        <Link href="/teacher/create">
          <Button size="sm">New Course</Button>
        </Link>
      }
    />
  );
}
