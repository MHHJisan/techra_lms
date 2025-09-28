import { Category, Course } from "@prisma/client";

import { getProgress } from "@/actions/get-progress";

import { db } from "@/lib/db";


type coureWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
};

type GetCourses = {
  userId?: string;
  title?: string;
  categoryId?: string;
  createdByUserId?: string;
  includeUnpublished?: boolean; // admin scope: include drafts
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
  createdByUserId,
  includeUnpublished,
}: GetCourses): Promise<coureWithProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: includeUnpublished ? undefined : true,
        title: title ? { contains: title } : undefined,
        categoryId,
        userId: createdByUserId || undefined,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        purchases: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const couresesWithProgress: coureWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          // If no userId or no purchases for this user, no progress
          if (!userId || ("purchases" in course && course.purchases.length === 0)) {
            return {
              ...course,
              progress: null,
            } as coureWithProgressWithCategory;
          }

          const progressPercentage = await getProgress(userId, course.id);

          return {
            ...course,
            progress: progressPercentage,
          } as coureWithProgressWithCategory;
        })
      );
    return couresesWithProgress;
  } catch (error) {
    console.log("GET_COURSES", error);
    return [];
  }
};
