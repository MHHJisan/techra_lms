"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, LogIn, GraduationCap, UserIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { useEffect, useState } from "react";
import Image from "next/image";

function isAbortError(err: unknown): boolean {
  // Browser-style AbortError (DOMException)
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    return err.name === "AbortError";
  }

  // Generic objects from different runtimes/fetch impls
  if (typeof err === "object" && err !== null) {
    const e = err as { name?: unknown; message?: unknown };
    if (e.name === "AbortError") return true;
    if (typeof e.message === "string" && /aborted/i.test(e.message))
      return true;
  }

  return false;
}

export const NavbarRoutes = () => {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/me", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setRole(data?.role ?? null);
          setIsAdmin(Boolean(data?.isAdmin));
        }
      } catch (err) {
        if (!isAbortError(err)) {
          // Only log real failures
          console.error("GET /api/me failed:", err);
        }
      } finally {
        if (!ignore) setReady(true);
      }
    })();

    return () => {
      ignore = true;
      controller.abort(); // triggers AbortError in dev; we ignore it above
    };
  }, []);

  // const isTeacherPage = pathname?.startsWith("/teacher") ?? false;
  const isStudentPlayerPage = pathname?.startsWith("/courses") ?? false;
  const isSearchPage = pathname === "/search";
  const showPublicBrand = !ready || role === null;

  return (
    <>
      {showPublicBrand && (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2 sm:gap-4 rounded-full px-2.5 py-1.5 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 text-white shadow-sm hover:shadow-md transition"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-white/95 p-1 shadow-sm">
              <Image src="/logo.svg" alt="Techra" width={26} height={26} />
            </span>
            <span className="hidden sm:inline text-base md:text-xl font-semibold tracking-wide md:tracking-wider whitespace-nowrap">
              Techra Learning Center
            </span>
          </Link>
        </div>
      )}

      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}

      <div className="flex gap-x-2 ml-auto items-center shrink-0">
        {/* Show Home only on the student player */}
        {isStudentPlayerPage && (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        )}

        {ready && role === "student" && (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 shadow-sm">
            <GraduationCap className="h-4 w-4 mr-2 opacity-90" />
            Hello Student
          </span>
        )}

        {/* Badges after role is known */}
        {ready && role === "teacher" && (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 shadow-sm">
            <UserIcon className="h-4 w-4 mr-2 opacity-90" />
            Hello Teacher
          </span>
        )}

        {ready && isAdmin && (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 shadow-sm">
            <HomeIcon className="h-4 w-4 mr-2 opacity-90" />
            It&apos;s admin here
          </span>
        )}

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonTrigger:
                  "focus:outline-none focus:ring-0 ring-0 outline-none",
                userButtonBox: "focus:outline-none",
              },
            }}
          />
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in">
            <Button
              size="sm"
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        </SignedOut>
      </div>
    </>
  );
};
