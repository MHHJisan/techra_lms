"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TogglePublishButton({
  courseId,
  isPublished,
  onToggled,
}: {
  courseId: string;
  isPublished: boolean;
  onToggled?: (next: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(isPublished);
  const router = useRouter();

  const toggle = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}/publish`, {
          method: "PATCH",
        });
        if (!res.ok) throw new Error("Failed to toggle");
        const data = (await res.json()) as { isPublished: boolean };
        setLocal(data.isPublished);
        onToggled?.(data.isPublished);
        router.refresh();
      } catch (e) {
        // noop; could show toast in future
      }
    });
  };

  return (
    <Button variant={local ? "secondary" : "default"} size="sm" onClick={toggle} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : local ? (
        "Unpublish"
      ) : (
        "Publish"
      )}
    </Button>
  );
}
