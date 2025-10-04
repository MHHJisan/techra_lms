import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  // Step 1: fetch minimal meta to determine ownership
  const courseMeta = await db.course.findUnique({
    where: { id: params.courseId },
    select: { id: true, userId: true, isPublished: true },
  });

  if (!courseMeta) {
    return redirect("/");
  }

  // Do not redirect to a specific chapter. Let the layout render the sidebar
  // with all chapter names, and show a friendly placeholder here.
  return (
    <div className="p-6">
      <div className="rounded-md border bg-white p-6">
        <h1 className="text-xl font-semibold mb-2">Course</h1>
        <p className="text-sm text-slate-600">
          Select a chapter from the sidebar to view its content.
        </p>
      </div>
    </div>
  );
};

export default CourseIdPage;
