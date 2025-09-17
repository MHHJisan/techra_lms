"use client";

import MuxPlayer from "@mux/mux-player-react";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  className?: string;
}

export const VideoPlayer = ({
  playbackId,
  isLocked,
  title,
  className,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);

  return (
    // 16:9 responsive box (zero dependency)
    <div
      className="relative z-0 w-full rounded-md overflow-hidden bg-black"
      style={{ paddingTop: "56.25%" }} // 9 / 16 = 0.5625
    >
      {/* Loading overlay */}
      {!isReady && !isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/60">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" />
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {/* Player fills the box */}
      {!isLocked && (
        <MuxPlayer
          title={title}
          playbackId={playbackId}
          autoPlay
          onCanPlay={() => setIsReady(true)}
          onError={(e) => console.error("Mux Player Error:", e)}
          className={clsx("absolute inset-0 w-full h-full z-0", className)}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};
