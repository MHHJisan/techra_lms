"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AdminUserActionsProps {
  userId: string;
  email?: string | null;
  currentRole?: string | null;
}

export default function AdminUserActions({
  userId,
  email,
  currentRole,
}: AdminUserActionsProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(currentRole || "user");

  const onSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This cannot be undone."
      )
    )
      return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("id", userId);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2" title={email || undefined} data-email={email || undefined}>
      <select
        className="border rounded-md p-1 text-xs"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={loading}
      >
        <option value="user">user</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
        <option value="student">student</option>
      </select>
      <Button size="sm" onClick={onSave} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onDelete}
        disabled={loading}
      >
        Delete
      </Button>
    </div>
  );
}
