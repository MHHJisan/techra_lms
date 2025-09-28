import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"
import { getRoleInfo } from "@/lib/auth-roles";

export async function PATCH(req: Request, {
    params }: { params: { courseId: string}}
){
    try{
        const { userId } = auth()

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { isAdmin } = await getRoleInfo(userId);

        const course = await db.course.findFirst({
            where: isAdmin
              ? { id: params.courseId }
              : { id: params.courseId, user: { clerkId: userId } },
        });

        if(!course){
            return new NextResponse("Not Found", { status: 404})
        }

        const unPublishedCourse = await db.course.update({
            where: { id: params.courseId },
            data: { isPublished: false }
        })
        return NextResponse.json(unPublishedCourse)

    } catch(error) {
        console.log("[COURSE_ID_UNPUBLISH]", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}