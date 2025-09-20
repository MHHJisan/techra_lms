"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Stats — BN/EN synced with navbar toggle
 * Uses ?lang=bn|en, cookie, or localStorage (same sync as CategorySection)
 */

const CONTENT = {
  en: [
    { label: "Learners", value: "500+" },
    { label: "Courses", value: "08+" },
    { label: "Avg. Rating", value: "4.8/5" },
    { label: "Instructors", value: "10+" },
  ],
  bn: [
    { label: "শিক্ষার্থী", value: "500+" },
    { label: "কোর্স", value: "08+" },
    { label: "গড় রেটিং", value: "৪.৮/৫" },
    { label: "শিক্ষক", value: "১০+" },
  ],
} as const;

type Lang = "en" | "bn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function Stats() {
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

  useEffect(() => {
    const fromUrl = (params.get("lang") || "").toLowerCase();
    if (fromUrl === "bn" || fromUrl === "en") setLang(fromUrl as Lang);
  }, [params]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lang" && (e.newValue === "bn" || e.newValue === "en")) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stats = CONTENT[lang];

  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center rounded-lg border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/60 dark:bg-slate-900/60 hover:shadow-md hover:scale-105 hover:bg-blue-500 dark:hover:bg-blue-900/80 transition"
            >
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


