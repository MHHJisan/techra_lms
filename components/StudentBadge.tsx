"use client";

import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";

type Role = "student" | "teacher" | "admin" | "staff" | "guest" | string;

export default function StudentBadge() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/me", {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return; // silently ignore (or handle as needed)
        const data = await res.json();
        setRole(data?.role ?? null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // optional: console.error(e);
        }
      }
    })();

    return () => ac.abort();
  }, []);

  // Show ONLY for students. (No badge while loading or for any other role.)
  if (role !== "student") return null;

  return (
    <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 shadow-sm">
      <UserIcon className="h-4 w-4 mr-2 opacity-90" />
      Hello Student
    </span>
  );
}
