"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";


interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: { imageUrl: string }) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course Updated");
      toggleEdit();
      router.refresh();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        console.error("[COURSE_IMAGE_UPDATE_ERROR]", e.response?.data || e.message);
      } else {
        console.error("[COURSE_IMAGE_UPDATE_ERROR]", e);
      }
      toast.error("Something went wrong updating image");
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Course Image
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an image
            </>
          )}
          {!isEditing && initialData.imageUrl && <>Edit Image</>}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10" text-slate-500 />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image alt="Upload" fill className="" src={initialData.imageUrl} />
          </div>
        ))}
      {isEditing && (
        <div>
          <FileUpload
            endPoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  );
};
