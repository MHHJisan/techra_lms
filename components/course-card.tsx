import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "./icon-badge";
import { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/fomat";
import { CourseProgress } from "@/components/course-progress";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  isPublished: boolean;
  showStatusBadge?: boolean;
  rightAction?: ReactNode;
  href?: string; // optional override for click target
  instructorName?: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  isPublished,
  showStatusBadge = false,
  rightAction,
  href,
  instructorName,
}: CourseCardProps) => {
  return (
    <Link href={href || `/courses/${id}`}>
      <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image fill className="object-cover" alt={title} src={imageUrl} />
          {showStatusBadge && (
            <span
              className={
                "absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded " +
                (isPublished
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-rose-100 text-rose-700 border border-rose-200")
              }
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          )}
        </div>
        <div className="flex flex-col pt-2">
          <div className="flex items-start justify-between gap-2">
            <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transiion line-clamp-2">
              {title}
            </div>
            {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
          </div>
          <p className="text-xs text-muted-foregroud">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress value={progress} variant="success" size="sm" />
          ) : (
            <p className="text-md md:text-sm font-medium text-slate-700">
              {formatPrice(price)} টাকা/-
            </p>
          )}
          {(
            <p className="text-xs text-slate-600 mt-1">
              Instructor - {instructorName || "Instructor"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
