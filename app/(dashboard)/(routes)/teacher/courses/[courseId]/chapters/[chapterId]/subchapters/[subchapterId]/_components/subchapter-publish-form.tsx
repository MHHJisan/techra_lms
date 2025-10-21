"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Props {
  courseId: string;
  chapterId: string;
  subchapterId: string;
  isPublished: boolean;
}

export function SubchapterPublishForm({ courseId, chapterId, subchapterId, isPublished }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const path = isPublished ? "unpublish" : "publish";
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/subchapters/${subchapterId}/${path}`);
      toast.success(isPublished ? "Subchapter Unpublished" : "Subchapter Published");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Publish
        <Button onClick={toggle} disabled={loading} variant="outline" size="sm">
          {isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
