"use client";

import * as z from "zod";
import axios from "axios";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PlusCircle, VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  videoUrl: z
    .string()
    .min(1, { message: "Please enter a YouTube URL or video ID" })
    .refine((val) => {
      // Allow 11-char ID or valid YouTube URL
      if (/^[a-zA-Z0-9_-]{11}$/.test(val)) return true;
      try {
        const u = new URL(val);
        return (
          u.hostname.includes("youtube.com") || u.hostname === "youtu.be"
        );
      } catch (_) {
        return false;
      }
    }, { message: "Enter a valid YouTube link or 11-character ID" }),
});

interface ChapterVideoFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.videoUrl || "");

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      toast.success("Course Updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong in video Upload");
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Chapter Video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a Video
            </>
          )}
          {!isEditing && initialData.videoUrl && <>Edit Video</>}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <VideoIcon className="h-10 w-10" text-slate-500 />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            {/* Simple preview using privacy-enhanced domain */}
            <iframe
              className="w-full h-full rounded"
              src={`https://www.youtube-nocookie.com/embed/${(function(v){
                if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
                try { const u = new URL(v); if (u.searchParams.get("v")) return u.searchParams.get("v"); if (u.hostname === "youtu.be") return u.pathname.replace("/", ""); const p = u.pathname.split("/"); const i = p.findIndex((x) => x === "embed" || x === "shorts"); if (i !== -1 && p[i+1]) return p[i+1]; } catch(_) {}
                return "";
              })(initialData.videoUrl || "")}`}
              title="YouTube video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ))}
      {isEditing && (
        <div className="space-y-3">
          <Label htmlFor="videoUrl">YouTube URL or Video ID</Label>
          <Input
            id="videoUrl"
            placeholder="https://youtu.be/XXXXXXXXXXX or 11-char ID"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const parsed = formSchema.safeParse({ videoUrl: value.trim() });
                if (!parsed.success) {
                  toast.error(parsed.error.errors[0]?.message || "Invalid URL");
                  return;
                }
                onSubmit({ videoUrl: value.trim() });
              }}
            >
              Save
            </Button>
            <Button variant="outline" onClick={toggleEdit}>Cancel</Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Paste a YouTube link (privacy-enhanced) or the 11-character video ID.
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Ensure your YouTube video is public or unlisted for students to view.
        </div>
      )}
    </div>
  );
};
