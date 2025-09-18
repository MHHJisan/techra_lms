import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
  course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};

  purchases.forEach((purchases) => {
    const courseTitle = purchases.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    const price = purchases.course.price
      ? Number(purchases.course.price as unknown as number)
      : 0;
    grouped[courseTitle] += price;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId,
        },
      },
      include: {
        course: true,
      },
    });
    const groupedEarnings = groupByCourse(purchases);

    const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
      name: courseTitle,
      total,
    }));

    const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
    const totalSales = purchases.length;

    return { data, totalRevenue, totalSales };
  } catch (error) {
    console.log("[GET_ERROR");
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
