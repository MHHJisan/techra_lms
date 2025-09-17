// app/components/all-courses-view.tsx
import { ReactNode } from "react";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./general/categories";
import { db } from "@/lib/db";
import { TogglePublishButton } from "@/components/admin/toggle-publish-button";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

type AllCoursesViewProps = {
  courses: any[]; // shape returned by your getCourses()
  heading?: string; // defaults to "All Courses"
  showCount?: boolean; // display total count next to heading
  action?: ReactNode; // optional right-aligned action (e.g., a button)
  className?: string; // optional wrapper overrides
};

/**
 * Server Component (no "use client").
 * Use this as the common body for:
 * - /search
 * - /teacher/all-courses
 * - /admin/all-courses
 */
export default async function AllCoursesView({
  courses,
  heading = "All Courses",
  showCount = true,
  action,
  className,
}: AllCoursesViewProps) {
  const count = Array.isArray(courses) ? courses.length : 0;

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Admin check (role OR allowlist)
  const { userId } = auth();
  let isAdmin = false;
  if (userId) {
    const me = await db.user.findUnique({ where: { clerkId: userId } });
    // Role-based admin (preferred if set)
    if (me?.role?.toLowerCase() === "admin") {
      isAdmin = true;
    } else {
      // Email allowlist fallback
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      let emails: string[] = [];
      try {
        const cu = await clerkClient.users.getUser(userId);
        emails = cu.emailAddresses.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) as string[];
      } catch {}
      if (me?.email) emails.push(me.email.toLowerCase());
      if (emails.some((e) => adminEmails.includes(e))) {
        isAdmin = true;
      }
    }
  }

  return (
    <div className={["px-6", className].filter(Boolean).join(" ")}>
      <div className="p-6">
        <Categories items={categories} />
      </div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {heading}
          {showCount && (
            <span className="ml-2 text-base font-normal text-slate-500">
              ({count})
            </span>
          )}
        </h1>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {count > 0 ? (
        <CoursesList
          items={courses}
          renderActions={isAdmin ? (c) => (
            <TogglePublishButton
              courseId={c.id}
              isPublished={c.isPublished}
            />
          ) : undefined}
          showStatusBadge={isAdmin}
        />
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center text-slate-600">
          No courses found.
        </div>
      )}
    </div>
  );
}
