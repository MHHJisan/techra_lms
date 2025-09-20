"use client";

import { IconBadge } from "@/components/icon-badge";
import { LucideIcon } from "lucide-react";
import { useLang } from "@/app/providers/LanguageProvider";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string; // Already localized before being passed in
  icon: LucideIcon;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
}: InfoCardProps) => {
  const { lang } = useLang();

  const t = {
    en: {
      none: "No Courses",
      one: "Course",
      many: "Courses",
    },
    bn: {
      none: "কোনো কোর্স নেই",
      one: "কোর্স",
      many: "কোর্সসমূহ",
    },
  };

  const tr = t[lang];

  let courseText;
  if (numberOfItems === 0) {
    courseText = tr.none;
  } else if (numberOfItems === 1) {
    courseText = `1 ${tr.one}`;
  } else {
    courseText = `${numberOfItems} ${tr.many}`;
  }

  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3">
      <IconBadge variant={variant} icon={Icon} />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-500 text-sm">{courseText}</p>
      </div>
    </div>
  );
};
