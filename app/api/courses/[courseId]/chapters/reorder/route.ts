import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request, 
    { params } : { params: {courseId: string}}
) {
   try {
        const { userId } = auth();

        if(!userId) {
            return new NextResponse("Unauthorised", { status: 401})

        }

        const { list } = await req.json()

        const ownCourse = await db.course.findFirst({
            where: {
                id: params.courseId,
                user: { clerkId: userId }
            },
            select: { id: true }
        })
        if (!ownCourse) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        for (const item of list as Array<{ id: string; position: number }>) {
            await db.chapter.update({
                where: { id: item.id },
                data: { position: item.position }

            })
        }

        return new NextResponse("Success ", {status: 200 })
   } catch (error) {
        console.log("[REORDER]", error)
        return new NextResponse("Internal Error", { status: 500})
   } 
}