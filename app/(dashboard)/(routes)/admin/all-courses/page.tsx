// app/(admin)/admin/all-courses/page.tsx
import { getCourses } from "@/actions/get-courses";
import AllCoursesView from "@/components/all-courses-view";

export default async function AdminAllCoursesPage() {
  const courses = await getCourses({
    includeUnpublished: true,
  });
  return <AllCoursesView courses={courses} />;
}
