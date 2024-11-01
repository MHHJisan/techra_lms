"use client";

import { cn } from "@/lib/utils";

interface CategoryItemProps {
  label: string;
  value?: string;
  icon?: string;
}
export const CategoryItem = ({
  label,
  value,
  icon: Icon,
}: CategoryItemProps) => {
  return (
    <button
      className={cn(
        "py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-sky-700 transition"
        //change style if Active
      )}
      type="button"
    >
      {Icon && <Icon />}
      <div className="truncate">{label}</div>
    </button>
  );
};
