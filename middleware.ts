import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({});

export const config = {
  publicRoutes: ["/"], // Allow public access to the homepage
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Apply Clerk middleware to the /teacher/courses routes
    "/teacher/courses/:path*", // Protect all routes under /teacher/courses
    "/api/:path*",
    "/dashboard/:path*", // Match all routes under /dashboard
    "/other-group/:path*", // Match all routes under /other-group
  ],
};

//'/teacher/courses/:courseId/chapters/:chapterId',            // Also protect API routes if needed
