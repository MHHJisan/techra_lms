const { Mux } = require("@mux/mux-node");
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Use a proper way to handle the absence of env variables during the build
// if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
//   throw new Error('Mux token ID or secret is missing from environment variables');
// }

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

// const Video = muxClient.video; // Access the Video object

export async function  DELETE(req: Request, {params}: {params: {courseId: string}}) {
  try{
    const {userId} = auth()

    if(!userId) {
      return new NextResponse("Unauthorized", {status: 401})
    }

    const course = await db.course.findUnique({
      where:{
        id: params.courseId,
        userId
      },
      include:{
        chapters: {
          include:{
            muxData: true
          }
        }
      }
    });

    if(!course){
      return new NextResponse("Not Found", { status: 404})
    }

    for(const chapter of course.chapters){
      if(chapter.muxData?.assetId){
        await Video.assets.delete(chapter.muxData.assetId)
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId,
      }
    })

  }catch(error) {
    console.log("[COURSE_ID_DELETE]", error)
    return new NextResponse("Internal Error", {status: 500})
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
        return new NextResponse("Unauthorised", { status: 401});
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });


    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    if (course.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the course and log the result
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        ...values,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_ID] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
