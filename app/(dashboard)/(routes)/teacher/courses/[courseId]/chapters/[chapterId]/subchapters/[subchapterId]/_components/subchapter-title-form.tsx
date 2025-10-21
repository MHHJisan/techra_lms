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
  title: z.string().min(1, "Title is required"),
});

interface Props {
  courseId: string;
  chapterId: string;
  subchapterId: string;
  initialTitle: string;
}

export function SubchapterTitleForm({ courseId, chapterId, subchapterId, initialTitle }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((v) => !v);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: initialTitle || "" },
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
        Subchapter Title
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (<><Pencil className="h-4 w-4 mr-2" />Edit Title</>)}
        </Button>
      </div>
      {!isEditing && (
        <div className="text-sm mt-2">{initialTitle || <span className="text-slate-500 italic">No title</span>}</div>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="Enter title" />
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
