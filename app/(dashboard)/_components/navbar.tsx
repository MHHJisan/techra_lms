"use client";

import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/app/providers/LanguageProvider";

export const Navbar = () => {
  const { lang, toggleLang } = useLang();

  return (
    <div className="sticky top-0 z-50 p-3 md:p-4 border-b w-full flex items-center justify-between bg-white/95 backdrop-blur shadow-sm gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <MobileSidebar />
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image src="/techra.png" alt="Techra Logo" width={32} height={32} />
        </Link>
        <span className="font-semibold text-lg md:text-xl truncate">
          {lang === "bn"
            ? "টেকরা লার্নিং সেন্টারে স্বাগতম"
            : "Welcome to Techra Learning Center"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Your exact BN/EN pill button */}
        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
          aria-label={lang === "bn" ? "ইংরেজিতে পরিবর্তন করুন" : "Switch to Bangla"}
        >
          <span className={"rounded-full px-2 py-0.5 " + (lang === "bn" ? "bg-blue-600 text-white" : "text-gray-700")}>BN</span>
          <span className={"rounded-full px-2 py-0.5 " + (lang === "en" ? "bg-blue-600 text-white" : "text-gray-700")}>EN</span>
        </button>
        <NavbarRoutes />
      </div>
    </div>
  );
};
