"use client";

import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "./icon-badge";
import { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/fomat";
import { CourseProgress } from "@/components/course-progress";
import BuyNowButton from "@/components/buy-now-button";
import { useLang } from "@/app/providers/LanguageProvider";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  deliveryMode?: "ONLINE" | "IN_PERSON" | "HYBRID" | null;
  isPublished: boolean;
  showStatusBadge?: boolean;
  rightAction?: ReactNode;
  href?: string; // optional override for click target
  instructorName?: string;
  instructorImageUrl?: string | null;
  modalEnabled?: boolean;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  deliveryMode,
  isPublished,
  showStatusBadge = false,
  rightAction,
  href,
  instructorName,
  instructorImageUrl,
  modalEnabled = true,
}: CourseCardProps) => {
  const { lang } = useLang();
  const learnMoreLabel = lang === "bn" ? "আরও জারুন" : "Learn More";
  const currencyLabel = lang === "bn" ? "টাকা/-" : "Taka/-";
  const CardInner = (
    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-2 h-[300px] sm:h-[320px] md:h-[340px] lg:h-[360px] cursor-pointer flex flex-col">
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
      <div className="flex flex-col pt-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transiion line-clamp-2 min-h-[36px]">
            {title}
          </div>
          {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
        </div>
        <p className="text-xs text-muted-foregroud flex items-center justify-between gap-2">
          <span className="truncate">{category}</span>
          <span
            className={
              "inline-flex items-center px-2 py-0.5 text-[10px] rounded-full border shrink-0 " +
              (deliveryMode === "IN_PERSON"
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : deliveryMode === "HYBRID"
                ? "bg-sky-100 text-sky-700 border-sky-200"
                : "bg-emerald-100 text-emerald-700 border-emerald-200")
            }
          >
            {deliveryMode === "IN_PERSON"
              ? "In-person"
              : deliveryMode === "HYBRID"
              ? "Hybrid"
              : "Online"}
          </span>
        </p>
          <div className="mt-2 mb-1 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          <div className="mt-0">
            {progress !== null ? (
              <CourseProgress value={progress} variant="success" size="sm" />
            ) : (
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-md md:text-sm font-medium text-slate-700">
                  {formatPrice(price)} {currencyLabel}
                </p>
                {!showStatusBadge ? (
                  modalEnabled ? (
                    <Link
                      href={href || `/courses/${id}`}
                      className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                      onClick={(e) => {
                        // prevent opening the modal when clicking the Learn More link
                        e.stopPropagation();
                      }}
                    >
                      {learnMoreLabel}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white opacity-90">
                      {learnMoreLabel}
                    </span>
                  )
                ) : null}
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              {instructorImageUrl ? (
                <span className="inline-block h-6 w-6 relative overflow-hidden rounded-full bg-slate-200">
                  <Image
                    src={instructorImageUrl}
                    alt={instructorName || "Instructor"}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="inline-block h-6 w-6 rounded-full bg-slate-200" />
              )}
              <span>Instructor - {instructorName || "Instructor"}</span>
          </div>
          {/* Buy button is now inline with price above when visible */}
        </div>
    </div>
  );

  if (modalEnabled) {
    return (
      <BuyNowButton asChild learnMoreHref={href || `/courses/${id}`} courseId={id}>
        {CardInner}
      </BuyNowButton>
    );
  }
  return <Link href={href || `/courses/${id}`}>{CardInner}</Link>;
}
