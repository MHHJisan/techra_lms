import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";

const CoursesPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const courses = await getCourses({ userId });

  return (
    <div className="px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">All Courses</h1>
      <CoursesList items={courses} />
    </div>
  );
};

export default CoursesPage;
