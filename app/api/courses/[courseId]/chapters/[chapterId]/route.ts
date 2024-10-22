import Mux from "@mux/mux-node"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


// Initialize the Mux instance properly
const muxClient = new Mux(
  process.env.MUX_TOKEN_ID!,
);


export async function  PATCH(req: Request, { params }: { params: {courseId: string, chapterId: string}}) {
    try{
        const { userId } = auth()
        const { isPublished, ...values }= await req.json()

        if(!userId ) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId
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

        // Handle Mux video logic
        if (values.videoUrl) {
            const existingMuxData = await db.muxData.findFirst({
                where: {
                chapterId: params.chapterId,
                }
            })

        

            // If there is existing Mux data, delete the old asset
            if (existingMuxData) {
                await muxClient.video.assets.delete(existingMuxData.assetId); // Correct deletion method
                await db.muxData.delete({
                where: {
                    id: existingMuxData.id,
                }
                });
            }

            // Create new Mux asset for the new video URL
            const asset = await muxClient.video.assets.create({
                input: values.videoUrl,
                playback_policy: ["public"], // Adjust as per your requirement
                test: false,
            });

            // Ensure playbackId is a string
            const playbackId = asset.playback_ids?.[0]?.id;

            if (!playbackId) {
                throw new Error("Failed to retrieve playback ID from Mux.");
            }
            // Save the new Mux data to the database
            await db.muxData.create({
                data: {
                chapterId: params.chapterId,
                assetId: asset.id,
                playbackId: playbackId // Store the playback ID
                }
            });
        }


        return NextResponse.json(chapter)

    } catch (error) {
        console.log("[COURSES_CHAPTER_ID]", error)
        return new NextResponse("Internal Server Error", {status: 500})
    }
}