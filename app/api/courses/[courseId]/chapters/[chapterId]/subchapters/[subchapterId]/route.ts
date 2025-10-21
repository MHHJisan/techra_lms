import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { chapterId: string; subchapterId: string } }) {

    const item = await prisma.subChapter.findUnique({
        where: {
            id: params.subchapterId,
            chapterId: params.chapterId,
        }
    })

    // Students must not view draft subchapters
    // if (!item?.isPublished && !isInstructor(user)) return new NextResponse("Forbidden", { status: 403 });

    return NextResponse.json(item)
}


export async function PATCH(req: Request, { params }: { params: { chapterId: string; subchapterId: string } }) {
    const body = await req.json()
    const updated = await prisma.subChapter.update({
        where: {
            id: params.subchapterId,
            chapterId: params.chapterId,
        },
        data: {
            title: body.title,
            slug: body.slug,
            type: body.type,
            videoId: body.videoId,
            videoUrl: body.videoUrl,
            content: body.content,
            metadata: body.metadata,
        }
    });
    return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { chapterId: string; subchapterId: string } }) {
    //await assertChapterOwner(user, ...);
    await prisma.subChapter.delete({
        where: {
            id: params.subchapterId,
            chapterId: params.chapterId,
        }
    })
    return new NextResponse(null, {status: 204})    
}
        
    