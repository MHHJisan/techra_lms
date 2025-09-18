import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, {
    params }: { params: { courseId: string}}
){
    try{
        const { userId } = auth()

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const course = await db.course.findFirst({
            where:{
                id: params.courseId,
                user: { clerkId: userId }
            }, include:{
                chapters: true
            }
        });

        if(!course){
            return new NextResponse("Not Found", { status: 404})
        }

        const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished)

        if(!course.title || !course.description || !course.imageUrl || !course.categoryId || !hasPublishedChapter){
            return NextResponse.json({
              error: "Missing required fields",
              missing: [
                !course.title ? "title" : null,
                !course.description ? "description" : null,
                !course.imageUrl ? "imageUrl" : null,
                !course.categoryId ? "categoryId" : null,
                !hasPublishedChapter ? "publishedChapter" : null,
              ].filter(Boolean)
            }, {status: 400})
        }

        const publishedCourse = await db.course.update({
            where: {
                id: params.courseId,
            }, data: {
                isPublished: true
            }
        })
        return NextResponse.json(publishedCourse)

    } catch(error) {
        console.log("[COURSE_ID_PUBLISH]", error)
        return new NextResponse("Internal Error", {status: 500});
    }
}