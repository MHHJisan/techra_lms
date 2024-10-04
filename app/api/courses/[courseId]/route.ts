import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
        return new NextResponse("Unauthorised", { status: 401});
    }

    // Log values before the update
    console.log("Updating course:", courseId, "with values:", values);

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });


    if (!course) {
        console.log("Course-2", course);
      return new NextResponse("Course not found", { status: 404 });
    }

    console.log("course.userId=", course.userId);
    if (course.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the course and log the result
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        ...values,
      },
    });

    console.log("Updated course:", updatedCourse);
    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_ID] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
