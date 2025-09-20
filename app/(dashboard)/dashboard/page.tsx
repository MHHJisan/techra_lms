import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DebugUserClient from "@/components/DebugUserClient";
import DashboardSummary from "./_components/dashboard-summary";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);

  // Fetch user details from Clerk
  const user = await clerkClient.users.getUser(userId);

  const username =
    user.username ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User";

  return (
    <div>
      <DebugUserClient />

      {/* Client component handles all language-aware UI text */}
      <DashboardSummary
        username={username}
        inProgressCount={coursesInProgress.length}
        completedCount={completedCourses.length}
      />

      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
