"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Testimonials — BN/EN synced with navbar toggle
 * Reads lang from ?lang, cookie, or localStorage and reacts to navbar toggle
 */

const CONTENT = {
  en: [
    {
      name: "Amina K.",
      role: "Software Engineer",
      quote:
        "TECHRA-LMS helped me upskill quickly. The courses are concise, practical, and well-structured.",
    },
    {
      name: "Rahul S.",
      role: "Data Analyst",
      quote:
        "The hands-on approach and real-world projects made all the difference in my learning journey.",
    },
    {
      name: "Sara M.",
      role: "Student",
      quote:
        "I loved the flexibility and the quality of instruction. Highly recommend to anyone starting out!",
    },
  ],
  bn: [
    {
      name: "আমিনা কে.",
      role: "সফটওয়্যার ইঞ্জিনিয়ার",
      quote:
        "TECHRA-LMS আমাকে দ্রুত দক্ষ হতে সাহায্য করেছে। কোর্সগুলো সংক্ষিপ্ত, প্রায়োগিক এবং ভালোভাবে সাজানো।",
    },
    {
      name: "রাহুল এস.",
      role: "ডাটা অ্যানালিস্ট",
      quote:
        "হ্যান্ডস-অন পদ্ধতি এবং বাস্তব প্রকল্পগুলো আমার শেখার যাত্রায় সব পার্থক্য তৈরি করেছে।",
    },
    {
      name: "সারা এম.",
      role: "শিক্ষার্থী",
      quote:
        "আমি নমনীয়তা এবং প্রশিক্ষণের মান ভালোবাসতাম। যারা শুরু করছেন তাদের জন্য অত্যন্ত সুপারিশ করছি!",
    },
  ],
} as const;

type Lang = "en" | "bn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function Testimonials() {
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

  const testimonials = CONTENT[lang];

  const heading = lang === "bn" ? "শিক্ষার্থীরা যা বলে" : "What learners say";

  return (
    <section className="bg-gray-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          {heading}
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm hover:shadow-md transition"
            >
              <p className="text-slate-700 dark:text-slate-300">“{t.quote}”</p>
              <div className="mt-4">
                <div className="font-semibold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
