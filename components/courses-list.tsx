import { Category, Course } from "@prisma/client";
import { ReactNode } from "react";
import { CourseCard } from "./course-card";

type CourseWithProgressCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CourseWithProgressCategory[];
  renderActions?: (item: CourseWithProgressCategory) => ReactNode;
  showStatusBadge?: boolean;
}
export const CoursesList = ({ items, renderActions, showStatusBadge = false }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl: grid-cols-4 gap-4">
        {items.map((item) => {
          const imageUrl = item.imageUrl || "/img/course1.jpg";
          const priceNumber = item.price ? Number(item.price as any) : 0;
          const categoryName = item.category?.name || "Uncategorized";
          return (
            <div key={item.id} className="space-y-2">
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
