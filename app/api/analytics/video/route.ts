import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as z from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  videoId: z.string().min(1),
  type: z.enum(["ready", "play", "pause", "ended", "progress"]),
  currentTime: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, chapterId, videoId, type, currentTime } = parsed.data;

    await db.videoEvent.create({
      data: {
        userId: userId || null,
        courseId,
        chapterId,
        videoId,
        eventType: type,
        currentTime: currentTime ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[ANALYTICS_VIDEO_POST]", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
