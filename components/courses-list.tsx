import { Category, Course } from "@prisma/client";
import { ReactNode } from "react";
import { CourseCard } from "./course-card";

export type CourseWithProgressCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl?: string | null;
  };
};

interface CoursesListProps {
  items: CourseWithProgressCategory[];
  renderActions?: (item: CourseWithProgressCategory) => ReactNode;
  showStatusBadge?: boolean;
  buildHref?: (item: CourseWithProgressCategory) => string; // optional custom link builder
  enableCardModal?: boolean; // when true, clicking card opens buy modal (for students)
}
export const CoursesList = ({ items, renderActions, showStatusBadge = false, buildHref, enableCardModal = true }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 auto-rows-fr items-stretch">
        {items.map((item) => {
          const imageUrl = item.imageUrl || "/img/course1.jpg";
          const priceNumber = item.price ? Number(item.price as unknown as number) : 0;
          const categoryName = item.category?.name || "Uncategorized";
          const href = buildHref ? buildHref(item) : `/courses/${item.id}`;
          const instrName =
            [item.user?.firstName, item.user?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || (item.user?.email || "");
          const instrImage = item.user?.imageUrl ?? null;
          return (
            <div key={item.id} className="h-full">
              <CourseCard
                id={item.id}
                title={item.title}
                imageUrl={imageUrl}
                chaptersLength={item.chapters.length}
                price={priceNumber}
                progress={item.progress}
                category={categoryName}
                isPublished={item.isPublished}
                showStatusBadge={showStatusBadge}
                rightAction={renderActions ? renderActions(item) : undefined}
                href={href}
                instructorName={instrName}
                instructorImageUrl={instrImage}
                modalEnabled={enableCardModal}
              />
            </div>
          );
        })}
      </div>
      <div>
        {items.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-10">
            No courses found
          </div>
        )}
      </div>
    </div>
  );
};
