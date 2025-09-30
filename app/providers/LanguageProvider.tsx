"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "bn";

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang: Lang }) {
  // Initialize synchronously from server-provided value to avoid hydration mismatch
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Reflect lang into <html lang="..."> and localStorage and cookie
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
      // Also store in cookie so server can read on next request
      document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [lang]);



    // Remove the previous effect that forced URL to match state to avoid fighting changes:

  // Keep URL's ?lang in sync (preserves other query params)
  // useEffect(() => {
  //   const current = params.get("lang");
  //   if (current !== lang) {
  //     const usp = new URLSearchParams(params.toString());
  //     usp.set("lang", lang);
  //     router.replace(`${pathname}?${usp.toString()}`);
  //   }
  // }, [lang, params, pathname, router]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  // Cross-tab sync via storage event
  // useEffect(() => {
  //   const onStorage = (e: StorageEvent) => {
  //     if (e.key === "lang") {
  //       const v = e.newValue === "bn" ? "bn" : "en";
  //       setLangState(v);
  //     }
  //   };
  //   window.addEventListener("storage", onStorage);
  //   return () => window.removeEventListener("storage", onStorage);
  // }, []);

  // const setLang = useCallback((next: Lang) => {
  //   setLangState(next);
  // }, []);

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
