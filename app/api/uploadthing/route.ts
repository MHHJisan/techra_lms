import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

/**
 * This exposes the GET/POST handlers UploadThing's client talks to.
 * If this route is blocked by auth middleware or crashes,
 * the client will show “Failed to parse response…”.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
