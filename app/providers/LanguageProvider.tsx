"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Lang = "en" | "bn";

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [lang, setLangState] = useState<Lang>("en");

  // Initialize from URL (?lang=) or localStorage
  useEffect(() => {
    const urlLang = (params.get("lang") as Lang | null);
    const storedLang = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;

    const initial: Lang =
      urlLang === "bn" || urlLang === "en"
        ? urlLang
        : storedLang === "bn" || storedLang === "en"
        ? storedLang
        : "en";

    setLangState(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once (we'll sync URL below)

  // Reflect lang into <html lang="..."> and localStorage
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  // Keep URL's ?lang in sync (preserves other query params)
  useEffect(() => {
    const current = params.get("lang");
    if (current !== lang) {
      const usp = new URLSearchParams(params.toString());
      usp.set("lang", lang);
      router.replace(`${pathname}?${usp.toString()}`);
    }
  }, [lang, params, pathname, router]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lang") {
        const v = e.newValue === "bn" ? "bn" : "en";
        setLangState(v);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "bn" ? "en" : "bn"));
  }, []);

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang, setLang, toggleLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
