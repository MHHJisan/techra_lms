"use client";

import { cn } from "@/lib/utils";
import { Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CourseSubsidebarItemProps {
  label: string;
  id: string; // subchapterId
  courseId: string;
  chapterId: string;
  isLocked: boolean;
}

export const CourseSubsidebarItem = ({
  label,
  id,
  courseId,
  chapterId,
  isLocked,
}: CourseSubsidebarItemProps) => {
  const pathName = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : PlayCircle;

  const isActive = pathName?.includes(id);

  const onClick = () => {
    if (isLocked) {
      toast("You haven't enrolled to this course. Please enroll to access subchapters.", {
        icon: "🔒",
      });
      return;
    }
    router.push(`/courses/${courseId}/chapters/${chapterId}/subchapters/${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full flex items-center gap-x-2 text-slate-500 text-xs font-[500] pl-10 translate-all hover:text-slate-600 hover:bg-slate-300/10",
        isActive && "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-2">
        <Icon
          size={18}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-700",
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border border-slate-700 h-full translate-all",
          isActive && "opacity-100",
        )}
      ></div>
    </button>
  );
}
