"use client";

import {
  Layout,
  Compass,
  BarChart,
  List,
  Users,
  GraduationCap,
  Grid2X2,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const guestRoutes = [
  { icon: Layout, label: "Dashboard", href: "/" },
  { icon: Compass, label: "Browse", href: "/search" },
];

const teacherRoutes = [
  { icon: List, label: "Courses", href: "/teacher/courses" },
  { icon: BarChart, label: "Analytics", href: "/teacher/analytics" },
  { icon: Grid2X2, label: "All Courses", href: "/teacher/all-courses" },
];

const adminRoutes = [
  { icon: Layout, label: "All Users", href: "/admin/users" },
  { icon: Users, label: "Teachers", href: "/admin/teachers" },
  { icon: GraduationCap, label: "Students", href: "/admin/students" },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/me", {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = await r.json();
        setRole(data?.role ?? null);
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        // ignore network errors; we'll fall back to guest
      } finally {
        setReady(true);
      }
    })();
    return () => ac.abort();
  }, []);

  // Optional: a small skeleton to prevent flash
  if (!ready) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="h-8 bg-slate-100 rounded" />
        <div className="h-8 bg-slate-100 rounded" />
        <div className="h-8 bg-slate-100 rounded" />
      </div>
    );
  }

  const isTeacher = role === "teacher" || role === "instructor";
  const isAdminPage = pathname?.startsWith("/admin") ?? false;

  let routes = guestRoutes;

  if (isAdminPage && isAdmin) {
    routes = adminRoutes; // Admin on /admin → admin menu
  } else if (isTeacher) {
    routes = teacherRoutes; // Teacher anywhere else → teacher menu
  } else {
    routes = guestRoutes; // Everyone else → guest menu
  }

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
