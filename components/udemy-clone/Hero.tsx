// components/Hero.tsx
import Link from "next/link";
import Image from "next/image";
import { FiUser, FiArrowRight } from "react-icons/fi";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Learn Anytime, Anywhere
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Unlock your potential with expertly designed online courses from top instructors.
            </p>

            <form
              action="/search"
              method="GET"
              className="mt-8 flex w-full max-w-xl mx-auto lg:mx-0"
            >
              <input
                type="text"
                name="q"
                placeholder="Search for courses, topics, or instructors..."
                className="flex-1 rounded-l-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-r-md bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 font-medium shadow hover:opacity-90"
              >
                Explore Courses
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 px-5 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Browse Categories
              </Link>
            </div>

            <p className="mt-10 sm:mt-12 lg:mt-16 text-center">
              <span className="group inline-flex flex-col items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-6 py-3 text-lg font-extrabold text-slate-800 dark:text-slate-100 shadow-sm ring-1 ring-emerald-300/60 transition hover:shadow-md">
                <span className="inline-flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:scale-110" aria-hidden="true" />
                  <span>Already have an account?</span>
                </span>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 underline decoration-2 underline-offset-4 hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  <span>Log in to your courses</span>
                  <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </span>
            </p>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 opacity-90 flex items-center justify-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white/70 backdrop-blur-sm shadow-lg ring-2 ring-emerald-300/60 overflow-hidden animate-float">
                <Image
                  src="/techra.png"
                  alt="Techra Logo"
                  fill
                  sizes="(max-width: 768px) 7rem, (max-width: 1024px) 8rem, 9rem"
                  className="object-contain p-3"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
