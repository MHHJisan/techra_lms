"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationActions({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    if (!confirm("Delete this registration? This cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data?.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/admin/registrations/${id}`}
        className="text-sky-700 hover:underline"
      >
        View
      </a>
      <button
        onClick={onDelete}
        disabled={loading}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
