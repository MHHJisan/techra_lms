"use client";

import { PropsWithChildren, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BuyNowButtonProps extends PropsWithChildren {
  label?: string;
  asChild?: boolean;
  learnMoreHref?: string;
  learnMoreText?: string;
}

export default function BuyNowButton({ label = "Buy Now", asChild = false, children, learnMoreHref, learnMoreText = "Learn More" }: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asChild && children ? (
          // Use provided children as the trigger (click anywhere inside to open)
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
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
            onClick={(e) => {
              // Prevent navigation and open the dialog
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
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
  );
}
