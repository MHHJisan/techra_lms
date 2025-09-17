import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { db } from "@/lib/db";

export default async function TeacherAllCoursesPage() {
  const { userId } = auth();
  if (!userId) return redirect("/");

  // Ensure only teachers can view this page
  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (dbUser?.role !== "teacher") return redirect("/");

  const courses = await getCourses({});

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">All Courses</h1>
      <CoursesList items={courses} />
    </div>
  );
}
