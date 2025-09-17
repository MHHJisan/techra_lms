"use client";

import { useEffect } from "react";

export default function DebugUserClient() {
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        console.log("[CLIENT /api/me]", data);
      })
      .catch((err) => console.error("[CLIENT /api/me] error", err));
  }, []);
  return null;
}
