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
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
];

const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
  {
    icon: Grid2X2,
    label: "All Courses",
    href: "/teacher/all-courses",
  },
];

const adminRoutes = [
  {
    icon: Layout,
    label: "All Users",
    href: "/admin/users",
  },
  {
    icon: Users,
    label: "Teachers",
    href: "/admin/teachers",
  },
  {
    icon: GraduationCap,
    label: "Students",
    href: "/admin/students",
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me").then(async (r) => {
      try {
        const data = await r.json();
        if (active) setIsAdmin(!!data.isAdmin);
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);

  const isTecherPage = pathname?.includes("/teacher");
  const isAdminPage = pathname?.includes("/admin");

  let routes = isTecherPage ? teacherRoutes : guestRoutes;
  if (isAdmin && isAdminPage) routes = adminRoutes;

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
