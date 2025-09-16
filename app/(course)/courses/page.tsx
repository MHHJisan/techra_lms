import { Navbar } from "@/app/(dashboard)/_components/navbar";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";

const CoursesPage = async () => {
  const courses = await getCourses({});

  return (
    <div className="px-6 py-10">
      <Navbar />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold mb-6">All Courses</h1>
        <CoursesList items={courses} />
      </div>
    </div>
  );
};

export default CoursesPage;
