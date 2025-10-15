"use client";

import { ConfirmModal } from "@/components/modals/confirm-modals";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface SubchapterActionsProps {
  disabled?: boolean;
  courseId: string;
  chapterId: string;
  subchapterId: string;
  isPublished: boolean;
}

export const SubchapterActions = ({
  disabled,
  courseId,
  chapterId,
  subchapterId,
  isPublished,
}: SubchapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onTogglePublish = async () => {
    try {
      setIsLoading(true);
      const path = isPublished ? "unpublish" : "publish";
      await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/subchapters/${subchapterId}/${path}`
      );
      toast.success(isPublished ? "Subchapter Unpublished" : "Subchapter Published");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/subchapters/${subchapterId}`
      );
      toast.success("Subchapter Deleted");
      router.refresh();
      router.push(`/teacher/courses/${courseId}/chapters/${chapterId}`);
    } catch {
      toast.error("Failed to delete subchapter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onTogglePublish}
        disabled={!!disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
