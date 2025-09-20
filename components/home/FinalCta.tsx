"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * FinalCta — BN/EN synced with navbar toggle
 * - Reads from ?lang, cookie, or localStorage
 * - Preserves lang in CTA links
 */

type Lang = "en" | "bn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function FinalCta() {
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

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const query = lang ? { lang } : {};

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t("Start learning today", "আজই শেখা শুরু করুন")}
            </h2>
            <p className="mt-3 text-indigo-100">
              {t(
                "Join thousands of learners. Access high‑quality courses and level up your career.",
                "হাজারো শিক্ষার্থীর সাথে যুক্ত হন। উচ্চমানের কোর্সে প্রবেশ করুন এবং ক্যারিয়ারে এগিয়ে যান।"
              )}
            </p>
          </div>
          <div className="flex justify-center md:justify-end items-center gap-3">
            <Link
              href={{ pathname: "/courses", query }}
              prefetch={false}
              className="inline-flex items-center justify-center rounded-md bg-white text-slate-900 px-5 py-3 font-semibold shadow hover:opacity-90"
            >
              {t("Browse Courses", "সব কোর্স দেখুন")}
            </Link>
            <Link
              href={{ pathname: "/sign-up", query }}
              prefetch={false}
              className="inline-flex items-center justify-center rounded-md border border-white/70 text-white px-5 py-3 font-medium hover:bg-white/10"
            >
              {t("Create Account", "অ্যাকাউন্ট তৈরি করুন")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
