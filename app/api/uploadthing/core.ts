import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/**
 * Define your endpoint once on the server.
 * Do NOT copy sizes/types to the client—let the client use this by name only.
 */
export const ourFileRouter = {
  // Must match the client endpoint name exactly ("courseAttachment")
  courseAttachment: f({
    image: { maxFileSize: "4MB" }, // png/jpg/webp, etc.
    pdf: { maxFileSize: "16MB" }, // optional: allow PDFs too
  }).onUploadComplete(async () => {
    // `file.url` is the public URL.
    // You can persist metadata here if you want, but your form already POSTs it later.
  }),
  // Endpoint for course cover image uploads
  courseImage: f({
    image: { maxFileSize: "4MB" },
  }).onUploadComplete(async () => {
    // nothing to persist server-side here; client will PATCH course.imageUrl
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
