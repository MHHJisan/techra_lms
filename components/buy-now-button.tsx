"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BuyNowButtonProps extends PropsWithChildren {
  label?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  learnMoreHref?: string;
  learnMoreText?: string;
  courseId?: string;
}

export default function BuyNowButton({ label = "Buy Now", asChild = false, children, learnMoreHref, learnMoreText = "Learn More", courseId }: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash">("bkash");
  const [submitting, setSubmitting] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<null | "pending" | "approved" | "rejected">(null);

  // Fetch application/purchase status
  useEffect(() => {
    if (!courseId) return;
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/api/applications?courseId=${encodeURIComponent(courseId)}`, { cache: "no-store" });
        if (!res.ok) return; // unauth or error: fall back to default behavior
        const data = (await res.json()) as { hasPurchase: boolean; applicationStatus: null | "pending" | "approved" | "rejected" };
        if (!ignore) {
          setHasPurchase(Boolean(data?.hasPurchase));
          setApplicationStatus((data?.applicationStatus as any) ?? null);
        }
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, [courseId]);

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!courseId) {
      // No course context: just open payment modal
      setOpen(true);
      return;
    }
    if (hasPurchase || applicationStatus === "approved") {
      // Direct to course
      window.location.href = `/courses/${courseId}`;
      return;
    }
    if (applicationStatus === "pending") {
      // Show info modal instead of payment
      setStatusOpen(true);
      return;
    }
    // Default: open payment modal
    setOpen(true);
  };

  return (
    <>
      {/* Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {asChild && children ? (
            // Use provided children as the trigger (click anywhere inside to open)
            <div
              role="button"
              tabIndex={0}
              onClick={handleTrigger}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTrigger(e as any);
                }
              }}
            >
              {children}
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              onMouseDown={(e) => {
                // Prevent parent Link from handling this click
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={handleTrigger}
            >
              {label}
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <div className="w-full flex items-center justify-center">
            <div className="relative w-[420px] max-w-full aspect-[3/4]">
              <Image
                src="/payment/self_bkash.png"
                alt="Bkash Payment QR"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Actions row: Apply + Payment method selector */}
          <div className="mt-4 flex items-center justify-between gap-3">
            {/* Apply for Enrollment */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              onClick={(e) => {
                e.stopPropagation();
                if (!courseId || submitting) return;
                setSubmitting(true);
                fetch("/api/applications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ courseId, paymentMethod }),
                })
                  .then(async (r) => {
                    if (!r.ok) throw new Error((await r.json()).error || "Failed to apply");
                    setOpen(false);
                    // Put UI into pending state to block payment modal on next clicks
                    setApplicationStatus("pending");
                    setStatusOpen(true);
                  })
                  .catch((err) => {
                    console.error("Apply failed", err);
                    alert("Failed to submit application. Please try again.");
                  })
                  .finally(() => setSubmitting(false));
              }}
            >
              {submitting ? "Applying..." : "Apply for Enrollment"}
            </button>

            {/* Payment method selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Payment:</span>
              <button
                type="button"
                className={
                  "inline-flex items-center px-2 py-1 text-[11px] rounded-full border transition " +
                  (paymentMethod === "cash"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentMethod("cash");
                }}
              >
                Paid in cash
              </button>
              <button
                type="button"
                className={
                  "inline-flex items-center px-2 py-1 text-[11px] rounded-full border transition " +
                  (paymentMethod === "bkash"
                    ? "bg-pink-100 text-pink-800 border-pink-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentMethod("bkash");
                }}
              >
                Paid through bKash
              </button>
            </div>
          </div>
          {learnMoreHref ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="mb-2">To visit the course please click</p>
              <Link
                href={learnMoreHref}
                className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {learnMoreText}
              </Link>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Status Dialog for pending applications */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Application Submitted</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-700">
            Your application is in the queue. Please wait for the approval by the respective authority. Thanks for your patience.
          </div>
          {courseId && (hasPurchase || applicationStatus === "approved") && (
            <div className="mt-4">
              <Link
                href={`/courses/${courseId}`}
                className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
              >
                Go to course
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
