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



export async function DELETE(req: Request, { params }: { params: { courseId: string; chapterId: string } }) {
    try {
        const { userId } = auth(); // Ensure correct destructuring

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId
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

        // Check if the chapter has a video URL
        if (chapter.videoUrl) {
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId: params.chapterId,
                },
            });

            // If there's existing Mux data, delete the asset
            if (existingMuxData) {
                try {
                    await Video.assets.delete(existingMuxData.assetId);
                    await db.muxData.delete({
                        where: {
                            id: existingMuxData.id
                        }
                    })
                    console.log("Mux asset deleted: ", existingMuxData.assetId);
                } catch (error) {
                    if ( error === 404) {
                        console.log(`Asset not found on Mux: ${existingMuxData.assetId}`);
                        // You may want to delete the invalid reference in your database
                        // await db.muxData.delete({ where: { chapterId: params.chapterId } });
                    } else {
                        throw error; // Rethrow for other types of errors
                    }
                }
            }

            const deletedChapter = await db.chapter.delete({
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
            });
        

            // If there is existing Mux data, delete the old asset
            if (existingMuxData) {
            
                await Video.assets.delete(existingMuxData.assetId)
                await db.muxData.delete({
                where: {
                    id: existingMuxData.id,
                }
                });
                
            }

            // Create new Mux asset for the new video URL
            const asset = await Video.assets.create({
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