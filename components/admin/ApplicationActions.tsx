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

  const enrolled = current === "approved";

  return (
    <Button size="sm" variant={enrolled ? "secondary" : "default"} onClick={toggle} disabled={loading}>
      {loading ? "Saving..." : enrolled ? "Unenroll" : "Enroll"}
    </Button>
  );
}
