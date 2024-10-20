"use client";

import { Value } from "@prisma/client/runtime/library";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

import "react-quill/dist/quill.bubble.css";

import "@/components/editor";

interface PreviewProps {
  onChange: (value: string) => void;
  value: string;
}

export const Preview = ({ onChange, value }: EditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="bg-white">
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};
