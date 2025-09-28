import { Category, Course } from "@prisma/client";

import { getProgress } from "@/actions/get-progress";

import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";


type coureWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    clerkId?: string | null;
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
            clerkId: true,
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
          // Try to populate instructor info from Clerk if missing
          const u = course.user;
          if (u && !u.firstName && !u.lastName && !u.email && u.clerkId) {
            try {
              const cc = clerkClient();
              const cu = await cc.users.getUser(u.clerkId);
              const cFirst = (cu.firstName as string | null) ?? null;
              const cLast = (cu.lastName as string | null) ?? null;
              const cEmail = (cu.emailAddresses?.[0]?.emailAddress as string | null) ?? null;
              course = {
                ...course,
                user: {
                  ...u,
                  firstName: cFirst,
                  lastName: cLast,
                  email: u.email ?? cEmail,
                },
              } as typeof course;
            } catch {
              // ignore clerk errors
            }
          }

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
