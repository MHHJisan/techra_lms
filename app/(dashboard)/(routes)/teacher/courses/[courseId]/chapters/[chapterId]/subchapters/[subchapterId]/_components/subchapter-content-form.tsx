"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().optional(),
});

interface Props {
  courseId: string;
  chapterId: string;
  subchapterId: string;
  initialContent?: string | null;
}

export function SubchapterContentForm({ courseId, chapterId, subchapterId, initialContent }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((v) => !v);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: initialContent || "" },
  });

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
        Subchapter Content
        <Button onClick={toggleEdit} variant="ghost">{isEditing ? "Cancel" : (<><Pencil className="h-4 w-4 mr-2" />Edit Content</>)}</Button>
      </div>
      {!isEditing && (
        <div className={cn("text-sm mt-2", !initialContent && "text-slate-500 italic") }>
          {!initialContent && "No content"}
          {initialContent && <Preview value={initialContent} />}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Editor {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      )}
    </div>
  );
}
