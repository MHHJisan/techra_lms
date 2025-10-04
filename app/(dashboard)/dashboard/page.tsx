import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DebugUserClient from "@/components/DebugUserClient";
import DashboardSummary from "./_components/dashboard-summary";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
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

  const filter = typeof searchParams?.filter === "string" ? searchParams!.filter : undefined;
  const showOnlyInProgress = filter === "in-progress";
  const showOnlyCompleted = filter === "completed";

  // Default landing: redirect to in-progress view if no filter provided
  if (!filter) {
    return redirect("/dashboard?filter=in-progress");
  }

  return (
    <div className="space-y-2">
      <DebugUserClient />

      {/* Client component handles all language-aware UI text */}
      <DashboardSummary
        username={username}
        inProgressCount={coursesInProgress.length}
        completedCount={completedCourses.length}
      />

      <div className="pl-6">
        <h2 className="text-2xl font-semibold mb-2">
          {showOnlyInProgress ? "Courses in Progress" : showOnlyCompleted ? "Completed Courses" : "My Courses"}
        </h2>
        {showOnlyInProgress ? (
          <div>
            <CoursesList items={coursesInProgress} showStatusBadge enableCardModal={false} />
            {coursesInProgress.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">You have no courses in progress yet.</p>
            )}
          </div>
        ) : showOnlyCompleted ? (
          <div>
            <CoursesList items={completedCourses} showStatusBadge enableCardModal={false} />
            {completedCourses.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">You haven't completed any course.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
            <section>
              <h3 className="text-lg font-medium mb-3">In Progress</h3>
              <CoursesList items={coursesInProgress} showStatusBadge enableCardModal={false} />
            </section>
            <section>
              <h3 className="text-lg font-medium mb-3">Completed</h3>
              <CoursesList items={completedCourses} showStatusBadge enableCardModal={false} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
