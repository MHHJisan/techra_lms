"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubchaptersList, SubchapterItem } from "./subchapters-list";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

interface SubchaptersFormProps {
  courseId: string;
  chapterId: string;
}

export const SubchaptersForm = ({ courseId, chapterId }: SubchaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [items, setItems] = useState<SubchapterItem[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
    mode: "onChange",
  });
  const { isSubmitting, isValid } = form.formState;

  const loadItems = async () => {
    try {
      const res = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/subchapters?includeDrafts=1`
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (err) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterId]);

  const toggleCreating = () => {
    setIsCreating((prev) => {
      const next = !prev;
      if (next) form.reset({ title: "" });
      return next;
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/subchapters`, values);
      toast.success("Subchapter created");
      form.reset({ title: "" });
      setIsCreating(false);
      await loadItems();
      router.refresh();
    } catch (err) {
      console.error("Error while creating subchapter:", err);
      toast.error("Something went wrong");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/subchapters/reorder`, {
        list: updateData,
      });
      toast.success("Subchapters reordered");
      await loadItems();
    } catch (err) {
      console.error("Reorder error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/subchapters/${id}`);
  };

  const onPublish = async (id: string) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/subchapters/${id}/publish`);
      toast.success("Subchapter published");
      await loadItems();
      router.refresh();
    } catch (err) {
      toast.error("Publish failed");
    }
  };

  const onUnpublish = async (id: string) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/subchapters/${id}/unpublish`);
      toast.success("Subchapter unpublished");
      await loadItems();
      router.refresh();
    } catch (err) {
      toast.error("Unpublish failed");
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-slate-500/20 rounded-md flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}

      <div className="font-medium flex items-center justify-between">
        Chapter Subchapters
        <Button onClick={toggleCreating} type="button" variant="ghost">
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a subchapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction video'"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div className={cn("text-sm mt-2", !items.length && "text-slate-500 italic") }>
          {!items.length && "No subchapters"}
          {!!items.length && (
            <SubchaptersList
              items={items}
              onReorder={onReorder}
              onEdit={onEdit}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
            />
          )}
        </div>
      )}

      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">You can reorder and edit subchapters later.</p>
      )}
    </div>
  );
};
