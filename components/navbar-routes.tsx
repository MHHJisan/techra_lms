"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, LogIn } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";

export const NavbarRoutes = () => {
  const pathname = usePathname();

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
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isPlayerPage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              <SignedIn>Dashboard</SignedIn>
              <SignedOut>Home</SignedOut>
            </Button>
          </Link>
        ) : (
          <Link href="/teacher/courses">
            <Button>Teacher Mode</Button>
          </Link>
        )}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
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
