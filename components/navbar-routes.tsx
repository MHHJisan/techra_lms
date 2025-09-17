"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, LogIn, GraduationCap } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { useEffect, useState } from "react";

export const NavbarRoutes = () => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/me").then(async (res) => {
      try {
        const data = await res.json();
        if (isMounted) {
          setRole(data.role ?? null);
          setIsAdmin(!!data.isAdmin);
        }
      } catch {}
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/search";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto items-center">
        {isTeacherPage || isPlayerPage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              <SignedIn>Dashboard</SignedIn>
              <SignedOut>Home</SignedOut>
            </Button>
          </Link>
        ) : role === "teacher" ? (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 shadow-sm">
            <GraduationCap className="h-4 w-4 mr-2 opacity-90" />
            Hello Teacher
          </span>
        ) : null}
        {isAdmin && (
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 shadow-sm">
            It's admin here
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
            <Button size="sm" variant="outline">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        </SignedOut>
      </div>
    </>
  );
};
