import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getRoleInfo } from "@/lib/auth-roles"
import { promise } from "zod"
import { title } from "process"
import { error } from "console"

export async function PATCH (
    req: Request,
    { params }: {params: {courseId: string, chapterId: string}}
) {
    try{
        const {userId} = auth()

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { isAdmin } = await getRoleInfo(userId)

        const ownCourse = await db.course.findFirst({
            where: isAdmin
              ? { id: params.courseId }
              : { id: params.courseId, user: { clerkId: userId } }
        })
        if(!ownCourse){
            return new NextResponse("Unauthorized", { status: 401})
        }

        const chapter = await db.chapter.findUnique({
            where:{
                id: params.chapterId,
                courseId: params.courseId
            }
        })

        if (!chapter) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const missing: string[] = [];
        if (!chapter.title) missing.push("title");
        if (!chapter.description) missing.push("description");
        if (!chapter.videoUrl) missing.push("videoUrl");
        if (missing.length) {
            return NextResponse.json(
                { error: "Missing required fields", missing },
                { status: 400 }
            );
        }

        //validate any 3 of 5 fields 
        const [materialsCount, assignmentCount] = await Promise.all([
            db.chapterMaterial.count({where: { chapterId: params.chapterId }}),
            db.chapterAssignment.count({where: { chapterId: params.chapterId }})
        ])

        const hasTitle = Boolean(chapter.title && chapter.title.trim());
        const hasDescription = Boolean(chapter.description && chapter.description.trim());
        const hasVideoUrl = Boolean(chapter.videoUrl && chapter.videoUrl.trim());
        const hasMaterials = materialsCount > 0;
        const hasAssignments = assignmentCount > 0;

        const completed = [hasTitle, hasDescription, hasVideoUrl, hasMaterials, hasAssignments].filter(Boolean).length >= 3;

        if (!completed) {
            const details = {
                title: hasTitle,
                description: hasDescription,
                video: hasVideoUrl,
                materials: hasMaterials,
                assignments: hasAssignments,
                required: "Any 3 of 5 must be completed",
            };
            return NextResponse.json({ error: "Incomplete Chapter", details }, { status:400});
        }

        const publishedChapter = await db.chapter.update({
            where:{
                id: params.chapterId,
                courseId: params.courseId
            }, data: {
                isPublished: true
            }
        })

        return NextResponse.json(publishedChapter)
    }catch (error) {
        console.log("[CHAPTER_PUBLISH", error) 
        return new NextResponse("Internal Error", { status: 500 })
    }
}