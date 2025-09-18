"use client";

import YouTube from "react-youtube";
import { Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

interface VideoPlayerProps {
  videoUrlOrId: string; // Accept full YouTube URL or bare video ID
  courseId: string;
  chapterId: string;
  isLocked: boolean;
  // nextChapterId?: string; // reserved for future use
  // completeOnEnd?: boolean; // reserved for future use
  // title?: string; // reserved for future use
  className?: string;
}

function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  // If it's already a plain ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtube.com")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const parts = url.pathname.split("/");
      // Handle /embed/{id} or /shorts/{id}
      const embedIndex = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (id) return id;
    }
  } catch (_) {
    // not a URL, fallthrough
  }
  return null;
}

export const VideoPlayer = ({
  videoUrlOrId,
  isLocked,
  className,
  chapterId,
  courseId,
  // nextChapterId,
  // completeOnEnd,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  type YTPlayerLike = { getCurrentTime?: () => number };
  const ytPlayerRef = useRef<YTPlayerLike | null>(null);
  const [lastPingTime, setLastPingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const videoId = useMemo(() => extractYouTubeId(videoUrlOrId) || "", [videoUrlOrId]);

  const sendEvent = useCallback(async (type: string, payload?: Record<string, unknown>) => {
    try {
      await fetch("/api/analytics/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          courseId,
          chapterId,
          videoId,
          ...payload,
        }),
      });
    } catch (e) {
      // swallow analytics errors
    }
  }, [chapterId, courseId, videoId]);

  const startProgressPings = useCallback(() => {
    if (!ytPlayerRef.current) return;
    if (intervalId) return; // already started
    const id = setInterval(() => {
      try {
        const player = ytPlayerRef.current;
        if (!player || typeof player.getCurrentTime !== "function") return;
        const t = player.getCurrentTime() ?? 0;
        if (Math.floor(t) !== Math.floor(lastPingTime)) {
          setLastPingTime(t);
          sendEvent("progress", { currentTime: t });
        }
      } catch (_) {}
    }, 10000); // every 10s
    setIntervalId(id);
  }, [intervalId, lastPingTime, sendEvent]);

  const stopProgressPings = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  useEffect(() => {
    return () => {
      stopProgressPings();
    };
  }, [stopProgressPings]);

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
      {!isLocked && videoId && (
        <YouTube
          videoId={videoId}
          opts={{
            host: "https://www.youtube-nocookie.com",
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
              cc_load_policy: 0,
            },
          }}
          onReady={(e: { target: YTPlayerLike }) => {
            ytPlayerRef.current = e.target;
            setIsReady(true);
            sendEvent("ready");
          }}
          onPlay={() => {
            startProgressPings();
            sendEvent("play");
          }}
          onPause={() => {
            stopProgressPings();
            sendEvent("pause");
          }}
          onEnd={() => {
            stopProgressPings();
            sendEvent("ended");
          }}
          className={clsx("absolute inset-0 w-full h-full z-0", className)}
          iframeClassName={clsx("absolute inset-0 w-full h-full z-0", className)}
        />
      )}
    </div>
  );
};
