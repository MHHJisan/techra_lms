import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { courseId: string; chapterId: string } }) {
    try {
        const { userId } = auth(); // Ensure correct destructuring

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownCourse = await db.course.findFirst({
            where: {
                id: params.courseId,
                user: { clerkId: userId }
            }
        })

        if(!ownCourse) {
            return new NextResponse("Unauthorized for course owning", {status: 401})
        }

        // Fetch chapter
        const chapter = await db.chapter.findUnique({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            },
        });

        console.log(chapter || "Chapter not found")
        if (!chapter) {
            
            return new NextResponse("Chapter Not Found", { status: 404 });
        }

        // Delete chapter (no external video provider cleanup needed)
        await db.chapter.delete({
            where:{
                id: params.chapterId
            }
        })

        const publishedChapterInCourse = await db.chapter.findMany({
            where:{
                courseId:params.courseId,
                isPublished: true 
            }
        }); 

        if(!publishedChapterInCourse.length){ 
            await db.course.update({
                where:{
                    id: params.courseId,
                }, data:{
                    isPublished: false,
                }
            })
        }

        return new NextResponse("Chapter deleted successfully", { status: 200 });
    } catch (err) {
        // Correct logging of the error object
        console.error("[CHAPTER_ID_DELETE_ERROR]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


export async function  PATCH(req: Request, { params }: { params: {courseId: string, chapterId: string}}) {
    try{
        const { userId } = auth()
        const payload = await req.json()
        const { /* isPublished, */ ...values } = payload

        if(!userId ) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const ownCourse = await db.course.findFirst({
            where: {
                id: params.courseId,
                user: { clerkId: userId }
            }
        })

        if(!ownCourse ) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        
        const chapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            }, 
            data: {
                ...values,
            }
        })

        // No Mux logic; videoUrl is a YouTube URL or ID stored directly on Chapter


        return NextResponse.json(chapter)

    } catch (error) {
        console.log("[COURSES_CHAPTER_ID]", error)
        return new NextResponse("Internal Server Error", {status: 500})
    }
}