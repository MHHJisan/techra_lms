// app/teacher/courses/[courseId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

import { Banner } from "@/components/banner";
import { IconBadge } from "@/components/icon-badge";

import { Actions } from "./_components/actions";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";

import {
  LayoutDashboard,
  ListChecks,
  CircleDollarSign,
  File,
} from "lucide-react";

type PageProps = {
  params: { courseId: string };
};

export default async function CourseIdPage({ params }: PageProps) {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect("/");

  // Ensure the course belongs to the signed-in teacher by matching related User.clerkId
  const course = await db.course.findFirst({
    where: {
      id: params.courseId,
      user: { clerkId }, // relation filter
    },
    include: {
      chapters: { orderBy: { position: "asc" } },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!course) {
    // Avoid redirect loops; show 404 if not owned/not found
    return notFound();
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((ch) => ch.isPublished),
  ];
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${requiredFields.length}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is unpublished. It will not be visible to the students." />
      )}

      <div className="pl-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course Setup</h1>
            <span className="text-sm text-slate-800">
              Complete all fields {completionText}
            </span>
          </div>

          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* Left column */}
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge variant="success" icon={LayoutDashboard} />
              <h2 className="text-xl">Customise your course</h2>
            </div>

            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />

            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6 mr-6 ml-2">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Course Chapters</h2>
            </div>
            <ChaptersForm initialData={course} courseId={course.id} />

            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h2 className="text-xl">Sell your course</h2>
            </div>
            <div className="ml-2">
              <PriceForm initialData={course} courseId={course.id} />
            </div>

            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h2 className="text-xl">Resources & Attachments</h2>
            </div>
            <AttachmentForm initialData={course} courseId={course.id} />
          </div>
        </div>
      </div>
    </>
  );
}
