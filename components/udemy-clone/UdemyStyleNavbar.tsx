"use client";

import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") || "en").toLowerCase();
  const nextLang = lang === "bn" ? "en" : "bn";

  const toggleLang = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Logo (Categories nav removed as requested) */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="hidden text-xl font-bold text-gray-900 sm:inline">{lang === "bn" ? "টেকরা লার্নিং সেন্টার" : "Techra Learning Center"}</span>
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="hidden flex-1 px-6 md:flex">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder={lang === "bn" ? "যেকোনো কিছু খুঁজুন" : "Search for anything"}
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
              />
            </svg>
          </div>
        </div>

        {/* Right side: Links + Buttons + Language toggle */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/sign-in" className="hidden text-sm font-medium text-gray-700 hover:text-blue-600 md:inline">
            {lang === "bn" ? "টেকরায় শেখান" : "Teach on Techra"}
          </Link>
          <Link href="/courses" className="hidden text-sm font-medium text-gray-700 hover:text-blue-600 md:inline">
            {lang === "bn" ? "কোর্সসমূহ" : "Courses"}
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-blue-600"
            aria-label={lang === "bn" ? "কার্ট দেখুন" : "View cart"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 006 0m-6 0a3 3 0 11-6 0m12 0a3 3 0 106 0m-6 0H7.5m12 0l1.5-6.75H6.621m0 0L5.25 4.5h15.128" />
            </svg>
          </Link>

          

          
                  <SignInButton mode="modal">
            <button className="hidden rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-yellow-500 hover:text-blue-600 hover:font-semibold hover:shadow-sm sm:inline">
              {lang === "bn" ? "লগ ইন/সাইন আপ" : "Login/Signup"}
            </button>
          </SignInButton>
          
                  {/* Language toggle BN/EN */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
            aria-label={lang === "bn" ? "ইংরেজিতে পরিবর্তন করুন" : "Switch to Bangla"}
          >
            <span className={"rounded-full px-2 py-0.5 " + (lang === "bn" ? "bg-blue-600 text-white" : "text-gray-700")}>BN</span>
            <span className={"rounded-full px-2 py-0.5 " + (lang === "en" ? "bg-blue-600 text-white" : "text-gray-700")}>EN</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
