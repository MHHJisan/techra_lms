"use client";

import {
  Layout,
  Compass,
  BarChart,
  List,
  Users,
  GraduationCap,
  Grid2X2,
  FileSpreadsheet,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { useEffect, useState } from "react";
import { useLang } from "@/app/providers/LanguageProvider";

const translations = {
  en: {
    dashboard: "Dashboard",
    browse: "Browse",
    myCourses: "My Courses",
    analytics: "Analytics",
    allCourses: "All Courses",
    allUsers: "All Users",
    teachers: "Teachers",
    students: "Students",
    registered: "Registered",
    applications: "Applications",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    browse: "ব্রাউজ করুন",
    myCourses: "আমার কোর্সসমূহ",
    analytics: "অ্যানালিটিক্স",
    allCourses: "সমস্ত কোর্স",
    allUsers: "সকল ব্যবহারকারী",
    teachers: "শিক্ষকবৃন্দ",
    students: "শিক্ষার্থীরা",
    registered: "রেজিস্ট্রেশন",
    applications: "আবেদনসমূহ",
  },
};

export const SidebarRoutes = () => {
  const { lang } = useLang();

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
        // ignore; fallback to guest
      } finally {
        setReady(true);
      }
    })();
    return () => ac.abort();
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="h-8 bg-slate-100 rounded" />
        <div className="h-8 bg-slate-100 rounded" />
        <div className="h-8 bg-slate-100 rounded" />
      </div>
    );
  }

  const t = translations[lang];

  const guestRoutes = [
    { icon: Layout, label: t.dashboard, href: "/dashboard" },
    { icon: Compass, label: t.browse, href: "/search" },
  ];

  const teacherRoutes = [
    { icon: List, label: t.myCourses, href: "/teacher/courses" },
    { icon: BarChart, label: t.analytics, href: "/teacher/analytics" },
    { icon: Grid2X2, label: t.allCourses, href: "/teacher/all-courses" },
  ];

  const adminRoutes = [
    { icon: Layout, label: t.allUsers, href: "/admin/users" },
    { icon: Users, label: t.teachers, href: "/admin/teachers" },
    { icon: GraduationCap, label: t.students, href: "/admin/students" },
    { icon: Grid2X2, label: t.allCourses, href: "/admin/all-courses" },
    { icon: FileSpreadsheet, label: t.registered, href: "/admin/registrations" },
    { icon: FileSpreadsheet, label: t.applications, href: "/admin/applications" },
  ];

  const isTeacher = role === "teacher" || role === "instructor";

  // Prioritize admin sidebar everywhere (including /teacher/* pages),
  // then teacher sidebar, otherwise guest.
  let routes = guestRoutes;
  if (isAdmin) routes = adminRoutes;
  else if (isTeacher) routes = teacherRoutes;

  return (
    <div className="flex flex-col w-full gap-2">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
      {/* No language toggle here; Navbar controls language */}
    </div>
  );
};
