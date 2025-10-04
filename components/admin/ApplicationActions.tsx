"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ApplicationActionsProps {
  id: string;
  status: string;
}

export default function ApplicationActions({ id, status }: ApplicationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(status);
  const [deleting, setDeleting] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const action = current === "approved" ? "unenroll" : "enroll";
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { status?: string };
      if (data?.status) setCurrent(data.status);
    } catch (e) {
      console.error(e);
      alert("Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this application? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      // Simple approach: refresh the page to reflect removal
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  const enrolled = current === "approved";

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={enrolled ? "secondary" : "default"}
        onClick={toggle}
        disabled={loading || deleting}
        className="w-28 justify-center"
      >
        {loading ? "Saving..." : enrolled ? "Unenroll" : "Enroll"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onDelete}
        disabled={loading || deleting}
        className="w-28 justify-center"
      >
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}

