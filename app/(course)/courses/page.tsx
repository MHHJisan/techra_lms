// app/courses/page.tsx
import type { Metadata } from "next";
import { Navbar } from "@/app/(dashboard)/_components/navbar";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import UdemyStyleNavbar from "@/components/udemy-clone/UdemyStyleNavbar";
import { auth } from "@clerk/nextjs/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const title = "All Courses – TECHRA LMS";
  const description = "Browse all published courses on TECHRA LMS. Find curated tech courses to learn and advance your career.";
  const canonical = `${siteUrl}/courses`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${canonical}?lang=en`,
        bn: `${canonical}?lang=bn`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const CoursesPage = async () => {
  // Get session / user info (server-side)
  // const session = await auth(); // returns null if not logged in
  const { userId } = await auth();
  const courses = await getCourses({});

  return (
    <div className="px-0">
      {/* Conditional navbar */}
      {userId ? <Navbar /> : <UdemyStyleNavbar />}

      <div className="mt-6 px-8">
        <h1 className="text-2xl text-center font-semibold mb-6">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            All Courses
          </button>
        </h1>
        <CoursesList items={courses} />
      </div>
    </div>
  );
};

export default CoursesPage;
