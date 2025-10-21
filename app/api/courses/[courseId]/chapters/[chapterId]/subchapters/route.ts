import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma";
import { getRoleInfo } from "@/lib/auth-roles";

export async function GET(req: Request, { params }: { params: { courseId: string; chapterId: string } }) {
    try {
        // Public: return only published for students; instructor can see all
        const { userId } = auth();
        const _roleInfo = await getRoleInfo(userId ?? null);
        const isInstructor = _roleInfo.isTeacher;
        const where = {
            chapterId: params.chapterId,
            ...(isInstructor ? {} : { isPublished: true })
        };

        const items = await prisma.subChapter.findMany({
            where,
            orderBy: {
                position: "asc"
            }
        });

        return NextResponse.json(items);
    } catch (err) {
        console.error("GET subchapters failed", err);
        return NextResponse.json({ error: "Failed to load subchapters" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { courseId: string; chapterId: string } }) {
    try {

        //ensure user owns course/chapter; reusing exiting guard
        //await assertChapterOwner(user, params.courseId, params.chapterId)

        const body = await req.json()
        const { title, slug, type, videoId, videoUrl, content } = body;

        const last = await prisma.subChapter.findFirst({
            where: {
                chapterId: params.chapterId,
                isPublished: true
            },
            orderBy: {
                position: "desc"
            },
            select: {
                position: true
            }   
        })

        const position = (last?.position ?? 0) + 1;

        // Note: Ensure your Prisma model is named correctly. This uses subChapter consistently.
        const created = await prisma.subChapter.create({
            data: {
                chapterId: params.chapterId,
                title,
                slug: slug ?? title,
                type,
                videoId: videoId ?? null,
                videoUrl,
                content: content ?? null,
                position,
            }
        }); 
        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        console.error("POST subchapter failed", err);
        return NextResponse.json({ error: "Failed to create subchapter" }, { status: 500 });
    }
}