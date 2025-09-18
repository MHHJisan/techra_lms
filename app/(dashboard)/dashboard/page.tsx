import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";
import { CheckCircle, Clock } from "lucide-react";
import { db } from "@/lib/db";
import DebugUserClient from "@/components/DebugUserClient";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );

  // Fetch user details from Clerk
  const user = await clerkClient.users.getUser(userId);

  // Also fetch corresponding DB user
  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });

  // Server-side logs (visible in server console)
  // console.log("[DASHBOARD_USER_CLERK]", {
  //   id: user.id,
  //   email: user.emailAddresses?.[0]?.emailAddress,
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   username: user.username,
  //   publicMetadata: user.publicMetadata,
  // });
  // console.log("[DASHBOARD_USER_DB]", dbUser);

  const isStudent = !dbUser?.role || dbUser.role === "student";

  // Use the preferred username or a fallback
  const username =
    user.username ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User";

  return (
    <div>
      <DebugUserClient />
      <div className="p-6 flex items-center gap-3 flex-wrap">
        <h1 className="text-xl">
          How u doing... ,{" "}
          <span className="text-xl font-bold text-green-500">{username}!</span>
          <span className="pl-2">this is your Dashboard...</span>
        </h1>
        {/* {isStudent && (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 shadow-sm">
            Hello Student
          </span>
        )} */}
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label="In Progress"
            numberOfItems={coursesInProgress.length}
          />
          <InfoCard
            icon={CheckCircle}
            label="Completed"
            numberOfItems={completedCourses.length}
            variant="success"
          />
        </div>
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
