"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FeaturedCourses = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") || "en").toLowerCase();

  return (
    <section className="relative py-5">
      {/* Decorative gradient background */}
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
            {lang === "bn" ? "বাছাইকৃত কোর্সসমূহ" : "Featured Courses"}
          </h2>
          <p className="mt-3 text-pretty text-gray-600">
            {lang === "bn" ? "আপনার আগ্রহের উপর ভিত্তি করে নির্বাচিত" : "Hand‑picked for you based on your interests."}
          </p>
        </div>

        {/* Cards placeholder */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Imagine map of courses here */}
          <article className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              {lang === "bn" ? "নমুনা কোর্স" : "Sample Course"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {lang === "bn" ? "এটি একটি ডেমো কার্ড" : "This is a demo card."}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/courses/demo"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                {lang === "bn" ? "বিস্তারিত দেখুন" : "Learn more"}
              </Link>
              <Link
                href="/courses/demo/enroll"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                {lang === "bn" ? "ভর্তি হোন" : "Enroll to this course"}
              </Link>
            </div>
          </article>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center relative z-20 pointer-events-auto">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md"
          >
            {lang === "bn" ? "সব কোর্স দেখুন" : "Browse all courses"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path fillRule="evenodd" d="M12.97 4.97a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L17.94 12l-4.97-4.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
