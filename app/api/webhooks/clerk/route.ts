import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";

// Optional: Verify Clerk webhook using Svix (recommended in production)
// If CLERK_WEBHOOK_SECRET is set, we will verify the signature.
import type { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    let evt: WebhookEvent | null = null;

    if (secret) {
      const hdrs = headers();
      const svixId = hdrs.get("svix-id");
      const svixTimestamp = hdrs.get("svix-timestamp");
      const svixSignature = hdrs.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
      }

      // Dynamically import svix only if needed (avoids dependency unless configured)
      const { Webhook } = await import("svix");
      const wh = new Webhook(secret);
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } else {
      // No secret configured: accept payload without verification (dev only)
      evt = JSON.parse(body);
    }

    if (!evt) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // We handle user.created and user.updated
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const user = evt.data as {
        id: string;
        image_url?: string | null;
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string | null;
        first_name?: string | null;
        last_name?: string | null;
      };
      const clerkId = user.id;
      const imageUrl = user.image_url ?? undefined;

      // Resolve primary email
      const emailAddresses = user.email_addresses ?? [];
      const primaryEmailId = user.primary_email_address_id ?? undefined;
      const primaryEmail =
        emailAddresses.find((e) => e.id === primaryEmailId)?.email_address ||
        emailAddresses[0]?.email_address;

      // Names
      const firstName = user.first_name ?? undefined;
      const lastName = user.last_name ?? undefined;

      await db.user.upsert({
        where: { clerkId },
        update: {
          email: primaryEmail ?? undefined,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          imageUrl: imageUrl ?? undefined,
        },
        create: {
          clerkId,
          email: primaryEmail || "",
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          imageUrl: imageUrl ?? undefined,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[CLERK_WEBHOOK]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
