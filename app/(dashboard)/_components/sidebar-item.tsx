"use client"

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItemPropos {
    icon: LucideIcon;
    label: string; 
    href: string; 
}

export const SidebarItem  = (
    {icon: Icon,
    label, 
    href,}: SidebarItemPropos
) => {

    const pathname = usePathname();

    // Normalize to avoid trailing slash discrepancies across browsers
    const normalize = (s?: string | null) => {
        if (!s) return "";
        return s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s;
    };
    const current = normalize(pathname);
    const target = normalize(href);

    const isActive =
        current === target ||
        (target !== "" && current.startsWith(`${target}/`));
    return ( 
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20", 
                isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
            )}
            >
            <div className="flex items-center gap-x-2 py-4">
                <Icon 
                    size={22}
                    className={cn("text-slate-500",
                    isActive && "text-sky-700"
                    )}
                />
                {label}
            </div>
            <div 
                className={cn("ml-auto opacity-0 border-2 border-sky-700 h-full transition-all",
                isActive && "opacity-100")}
            />
        </Link>
     );
}
 