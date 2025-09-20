"use client";

import { useLang } from "@/app/providers/LanguageProvider";
import { CheckCircle, Clock } from "lucide-react";
import { InfoCard } from "./info-card";

type Props = {
  username: string;
  inProgressCount: number;
  completedCount: number;
};

const t = {
  en: {
    greetingPrefix: "Welcome back,",
    greetingSuffix: "this is your dashboard.",
    inProgress: "In Progress",
    completed: "Completed",
  },
  bn: {
    greetingPrefix: "ফিরে আসার জন্য ধন্যবাদ,",
    greetingSuffix: "এটি আপনার ড্যাশবোর্ড।",
    inProgress: "চলমান",
    completed: "সম্পন্ন",
  },
};

export default function DashboardSummary({
  username,
  inProgressCount,
  completedCount,
}: Props) {
  const { lang } = useLang();
  const tr = t[lang];

  return (
    <>
      <div className="p-6 flex items-center gap-3 flex-wrap">
        <h1 className="text-xl">
          {tr.greetingPrefix}{" "}
          <span className="text-xl font-bold text-green-500">{username}</span>
          <span className="pl-2">{tr.greetingSuffix}</span>
        </h1>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label={tr.inProgress}
            numberOfItems={inProgressCount}
          />
          <InfoCard
            icon={CheckCircle}
            label={tr.completed}
            numberOfItems={completedCount}
            variant="success"
          />
        </div>
      </div>
    </>
  );
}
