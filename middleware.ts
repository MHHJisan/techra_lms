import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/teacher") || pathname.startsWith("/admin")) {
    if (!userId) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  publicRoutes: ["/", "/courses/:path*", "/api/webhooks/clerk"],
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/teacher/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
