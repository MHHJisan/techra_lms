"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";

type Props = {
  endPoint: keyof OurFileRouter; // "courseAttachment"
  onChange?: (url: string) => void; // gets the uploaded file URL
};

export function FileUpload({ endPoint, onChange }: Props) {
  return (
    <UploadDropzone<OurFileRouter>
      endpoint={endPoint}
      // Do NOT pass any config/file types/size here; they must be defined on the server only.
      onClientUploadComplete={(res) => {
        const url = res?.[0]?.url;
        if (url) onChange?.(url);
        toast.success("Uploaded");
      }}
      onUploadError={(err) => {
        // This will now surface server errors properly
        toast.error(err?.message || "Upload failed");
      }}
    />
  );
}
