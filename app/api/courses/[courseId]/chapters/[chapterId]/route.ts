const { Mux } = require("@mux/mux-node");



import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { error } from "console";


// Use a proper way to handle the absence of env variables during the build
if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error('Mux token ID or secret is missing from environment variables');
}

// Initialize Mux with token ID and token secret
const muxClient = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

const Video = muxClient.video; // Access the Video object

console.log("Mux Client:", muxClient);
console.log("Mux Video Object:", Video);


export async function DELETE(
    req: Request,
    {params} : {params: {courseId: string; chapterId: string}}
) {
   try{
        const userId = auth()

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 500})
        }

        const chapter = await db.chapter.findUnique(
            {
                where: {
                    id: params.chapterId,
                    courseId: params.courseId
                }
            }
        )

        if(!chapter){
            return new NextResponse("Not Found", {status: 404})
        }

        if (chapter.videoUrl){
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId: params.chapterId,
                }
            })

            if(existingMuxData){
                await Video.assets.delete(existingMuxData.assetId)
            }
        }
   } catch {
    console.log("[CHAPTER_ID_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
   } 
}
export async function  PATCH(req: Request, { params }: { params: {courseId: string, chapterId: string}}) {
    try{
        const { userId } = auth()
        console.log("User ID:", userId);
        const { isPublished, ...values }= await req.json()
        console.log("Request JSON:", values);

        if(!userId ) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId
            }
        })

        console.log("Own Course:", ownCourse);
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


        console.log("Updated Chapter:", chapter);
        // Handle Mux video logic
        if (values.videoUrl) {
            console.log("Video URL provided:", values.videoUrl);
            const existingMuxData = await db.muxData.findFirst({
                where: {
                chapterId: params.chapterId,
                }
            });
            console.log("Existing Mux Data:", existingMuxData);

        

            // If there is existing Mux data, delete the old asset
            if (existingMuxData) {
                console.log("Deleting old Mux asset with ID:", existingMuxData.assetId);
                await Video.assets.delete(existingMuxData.assetId)
                await db.muxData.delete({
                where: {
                    id: existingMuxData.id,
                }
                });
                console.log("Old Mux asset deleted");
            }

            // Create new Mux asset for the new video URL
            const asset = await Video.assets.create({
                input: values.videoUrl,
                playback_policy: ["public"], // Adjust as per your requirement
                test: false,
            });
            console.log("New Mux Asset Created:", asset);

            // Ensure playbackId is a string
            const playbackId = asset.playback_ids?.[0]?.id;

            if (!playbackId) {
                throw new Error("Failed to retrieve playback ID from Mux.");
            }

            console.log("New Playback ID:", playbackId);
            // Save the new Mux data to the database
            await db.muxData.create({
                data: {
                chapterId: params.chapterId,
                assetId: asset.id,
                playbackId: playbackId // Store the playback ID
                }
            });
            console.log("New Mux data saved in DB");
        }


        return NextResponse.json(chapter)

    } catch (error) {
        console.log("[COURSES_CHAPTER_ID]", error)
        return new NextResponse("Internal Server Error", {status: 500})
    }
}