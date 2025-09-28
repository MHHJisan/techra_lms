/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(site)/_components/FeaturedCourses.tsx  (SERVER COMPONENT)
import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { CoursesList } from "@/components/courses-list";
import { clerkClient } from "@clerk/nextjs/server";

function normalizeLang(v?: string | null) {
  return v?.toLowerCase() === "bn" ? "bn" : "en";
}
function t(lang: "en" | "bn", en: string, bn: string) {
  return lang === "bn" ? bn : en;
}

export default async function FeaturedCourses({
  lang: langProp,
  categoryId,
  q,
}: {
  lang?: "en" | "bn"; // <- receive from the page
  categoryId?: string;
  q?: string;
}) {
  // Fallback to cookie if the page didn’t pass it
  const cookieLang = cookies().get("lang")?.value;
  const lang = normalizeLang(langProp ?? cookieLang);

  const where: any = { isPublished: true };
  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ];
  }

  const courses = await db.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: { select: { id: true, name: true } },
      chapters: { select: { id: true } },
      user: { select: { firstName: true, lastName: true, email: true, clerkId: true } },
    },
  });

  // Fill missing instructor fields from Clerk as a fallback
  const cc = clerkClient();
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const u = course.user as
        | { firstName: string | null; lastName: string | null; email: string | null; clerkId?: string | null }
        | undefined;
      if (u && !u.firstName && !u.lastName && !u.email && u.clerkId) {
        try {
          const cu = await cc.users.getUser(u.clerkId);
          const cFirst = (cu.firstName as string | null) ?? null;
          const cLast = (cu.lastName as string | null) ?? null;
          const cEmail = (cu.emailAddresses?.[0]?.emailAddress as string | null) ?? null;
          course = {
            ...course,
            user: {
              ...u,
              firstName: cFirst,
              lastName: cLast,
              email: u.email ?? cEmail,
            },
          } as typeof course;
        } catch {
          // ignore clerk fallback errors
        }
      }
      return { ...course, progress: null };
    })
  );

  return (
    <section className="relative py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute right-[-20%] top-[-10%] h-[34rem] w-[34rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200" />
        <div className="absolute left-[-15%] bottom-[-20%] h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-sky-100 via-cyan-100 to-emerald-100" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t(lang, "Featured Courses", "বাছাইকৃত কোর্সসমূহ")}
          </h2>
          <p className="mt-3 text-pretty text-gray-600">
            {t(
              lang,
              "Hand-picked for you based on your interests.",
              "আপনার আগ্রহের উপর ভিত্তি করে নির্বাচিত"
            )}
          </p>
        </div>

        <div className="mt-10 items-center">
          <CoursesList items={coursesWithProgress} />
        </div>

        <div className="mt-12 text-center relative z-20 pointer-events-auto">
          <Link
            href={{ pathname: "/courses", query: { lang } }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md"
          >
            {t(lang, "Browse all courses", "সব কোর্স দেখুন")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M12.97 4.97a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L17.94 12l-4.97-4.97a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
