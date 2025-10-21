"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

const formSchema = z.object({
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  videoId: z.string().optional().or(z.literal("")),
});

interface Props {
  courseId: string;
  chapterId: string;
  subchapterId: string;
  initialVideoUrl?: string | null;
  initialVideoId?: string | null;
}

export function SubchapterVideoForm({ courseId, chapterId, subchapterId, initialVideoUrl, initialVideoId }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((v) => !v);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: initialVideoUrl || "",
      videoId: initialVideoId || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/subchapters/${subchapterId}`, values);
      toast.success("Updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Subchapter Video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (<><Pencil className="h-4 w-4 mr-2" />Edit Video</>)}
        </Button>
      </div>
      {!isEditing && (
        <div className="text-sm mt-2 space-y-1">
          <div>
            <span className="font-medium">URL:</span> {initialVideoUrl || <span className="text-slate-500 italic">None</span>}
          </div>
          <div>
            <span className="font-medium">Video ID:</span> {initialVideoId || <span className="text-slate-500 italic">None</span>}
          </div>
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="Optional ID (e.g. from provider)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          </form>
        </Form>
      )}
    </div>
  );
}
