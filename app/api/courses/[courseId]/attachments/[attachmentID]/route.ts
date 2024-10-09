import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { courseId, attachmentId },
    method,
  } = req;

  // Normalize attachmentID
  const id = Array.isArray(attachmentId) ? attachmentId[0] : attachmentId;

  if (method === 'GET') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Attachment ID is required' });
      }

      const attachment = await db.attachment.findUnique({
        where: {
          id,
        },
      });


      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      return res.status(200).json(attachment);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve attachment' });
    }
  }

  // Handle DELETE method
  if (method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Attachment ID is required' });
      }

      const deletedAttachment = await db.attachment.delete({
        where: {
          id,
        },
      });
      return res.status(200).json(deletedAttachment);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete attachment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


export async function DELETE(
    req: Request, 
    { params }: { params: {courseId: string, attachmentId: string}}) {
        console.log("Course ID:", params.courseId);
    console.log("Attachment ID:", params.attachmentId);
        if (!params.attachmentId) {
        return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
    }
    try{
        
        const { userId} = auth();

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const courseOwner = await db.course.findUnique(
            {
                where: { id: params.courseId, userId: userId}
            }
        );

        if(!courseOwner){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const deletedAttachment = await db.attachment.delete({
            where: {
                // courseId: params.courseId,
                id: params.attachmentId
            }
        })
        console.log("Deleting attachment with params:", params);

    }catch(error) {
        console.log("ATTACHMENT_ID", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}