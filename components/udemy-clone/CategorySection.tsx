"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaBook, FaVideo, FaQuestionCircle } from "react-icons/fa";

/**
 * CategorySection — BN/EN synced with navbar toggle
 * Redirect each card to a different external URL (same tab).
 * - Facebook for the first card, YouTube for the second, Google for the third.
 * - To open in a new tab, add target="_blank" rel="noopener noreferrer" on the <a>.
 */

const CONTENT = {
  en: [
    { icon: FaBook, title: "Courses", desc: "Explore various courses", href: "/courses" },
    { icon: FaVideo, title: "Videos", desc: "Watch educational videos", href: "https://www.youtube.com/@techra2811" },
    { icon: FaQuestionCircle, title: "Quizzes", desc: "Test your skills", href: "https://www.google.com/" },
  ],
  bn: [
    { icon: FaBook, title: "কোর্সসমূহ", desc: "বিভিন্ন কোর্স এক্সপ্লোর করুন", href: "/courses" },
    { icon: FaVideo, title: "ভিডিও", desc: "শিক্ষামূলক ভিডিও দেখুন", href: "https://www.youtube.com/@techra2811" },
    { icon: FaQuestionCircle, title: "কুইজ", desc: "আপনার দক্ষতা যাচাই করুন", href: "https://www.google.com/" },
  ],
} as const;

type Lang = "en" | "bn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function CategorySection() {
  const params = useSearchParams();

  const initialLang: Lang = useMemo(() => {
    const fromUrl = (params.get("lang") || "").toLowerCase();
    if (fromUrl === "bn" || fromUrl === "en") return fromUrl as Lang;
    const fromCookie = (readCookie("lang") || "").toLowerCase();
    if (fromCookie === "bn" || fromCookie === "en") return fromCookie as Lang;
    const fromLS = (typeof window !== "undefined" && localStorage.getItem("lang")) || "";
    if (fromLS === "bn" || fromLS === "en") return fromLS as Lang;
    return "en";
  }, [params]);

  const [lang, setLang] = useState<Lang>(initialLang);

  // Update when URL search param changes
  useEffect(() => {
    const fromUrl = (params.get("lang") || "").toLowerCase();
    if (fromUrl === "bn" || fromUrl === "en") setLang(fromUrl as Lang);
  }, [params]);

  // Listen for navbar toggles via localStorage "lang" changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lang" && (e.newValue === "bn" || e.newValue === "en")) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const items = CONTENT[lang];

  return (
    <section className="py-16 bg-white">
      <h2 className="text-center text-3xl font-bold mb-8">
        {t("What We Offer", "আমরা যা অফার করি")}
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {items.map((cat, idx) => (
          <a
            key={idx}
            href={cat.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(`Go to ${cat.title}`, `${cat.title} এ যান`)}
            className="block p-6 bg-gray-100 rounded-lg shadow-md text-center hover:shadow-lg transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <cat.icon className="text-blue-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold">{cat.title}</h3>
            <p className="text-gray-600 mt-2">{cat.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}