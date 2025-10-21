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
        const url = new URL(req.url);
        const includeDrafts = url.searchParams.get("includeDrafts") === "1";
        const where = {
            chapterId: params.chapterId,
            ...((isInstructor && includeDrafts) ? {} : { isPublished: true })
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
        const { title, slug, type, videoId, videoUrl, content } = body as {
            title: string;
            slug?: string;
            type?: string;
            videoId?: string | null;
            videoUrl?: string | null;
            content?: string | null;
        };

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

        // Create with required chapter relation; include optional fields only when present
        const created = await prisma.subChapter.create({
            data: {
                chapter: { connect: { id: params.chapterId } },
                title,
                slug: slug ?? title,
                position,
                ...(typeof type !== "undefined" ? { type } : {}),
                ...(typeof videoId !== "undefined" ? { videoId: videoId ?? null } : {}),
                ...(typeof videoUrl !== "undefined" ? { videoUrl: videoUrl ?? null } : {}),
                ...(typeof content !== "undefined" ? { content: content ?? null } : {}),
            },
        }); 
        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        console.error("POST subchapter failed", err);
        return NextResponse.json({ error: "Failed to create subchapter" }, { status: 500 });
    }
}