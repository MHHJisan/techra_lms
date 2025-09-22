import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CoursesTableClient from "./_components/CoursesTableClient";

const CoursePage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/");

  const courses = await db.course.findMany({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
  });

  // ❌ Do NOT call useCourseColumns() here — this is a server component
  return (
    <div className="pl-4 pt-4">
      <CoursesTableClient data={courses} />
    </div>
  );
};

export default CoursePage;
