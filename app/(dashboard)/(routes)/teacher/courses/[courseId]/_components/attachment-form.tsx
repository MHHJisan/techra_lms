"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, File, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course, Attachment } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

export const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: { url: string }) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success("Attachment added");
      toggleEdit();
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        console.error("[ATTACHMENT_ADD_ERROR]", e.response?.data || e.message);
      } else {
        console.error("[ATTACHMENT_ADD_ERROR]", e);
      }
      toast.error("Failed to add attachment");
    }
  };

  const onDelete = async (id: string) => {
    console.log("Deleting attachment with ID:", id); // Add this line
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Attachment deleted");
      router.refresh();
    } catch {
      console.error("Error deleting attachment:", Error); // Enhanced logging
      toast.error("Something went terribly Wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Course Attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an File
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="text-sm mt-2 text-slate-500">
              No Attachments yet ...
            </p>
          )}
          {initialData.attachments.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1">{attachment.name}</p>
                  {deletingId === attachment.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {deletingId !== attachment.id && (
                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="ml-auto hover:opacity-75 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endPoint="courseAttachment"
            onChange={(url) => {
              if (url) {
                onSubmit({ url: url });
              }
            }}
          />

          <div className="text-xs text-muted-foreground mt-4">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};
