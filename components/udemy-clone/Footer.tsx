"use client";

import { useEffect, useMemo, useState } from "react";
import { Facebook, Youtube } from "lucide-react";
import { useSearchParams } from "next/navigation";

/**
 * Footer — BN/EN synced with navbar toggle, years & brand localized
 */

type Lang = "en" | "bn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function toBengaliDigits(input: string | number) {
  const digits: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return input.toString().split("").map((ch) => digits[ch] ?? ch).join("");
}

export default function Footer() {
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

  const startYear = lang === "bn" ? toBengaliDigits(2022) : "2022";
  const currentYear = lang === "bn" ? toBengaliDigits(new Date().getFullYear()) : new Date().getFullYear();
  const brand = lang === "bn" ? "টেকরা" : "Techra";

  return (
    <footer className="py-6 bg-gray-800 text-gray-300 text-center md:pl-80">
      <div className="flex items-center justify-center gap-5 flex-wrap">
        <p className="m-0">
          &copy; {startYear}–{currentYear} {brand}. {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://facebook.com/Techrabd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/60 hover:bg-blue-600 text-gray-100 transition"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com/@techra2811"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/60 hover:bg-red-600 text-gray-100 transition"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
