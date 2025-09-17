// Server Component: no "use client"
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Hero from "@/components/udemy-clone/Hero";
import CategorySection from "@/components/udemy-clone/CategorySection";
import FeaturedCourses from "@/components/udemy-clone/FeaturedCourses";
import Footer from "@/components/udemy-clone/Footer";
import LoginPageClient from "./_components/LoginPageClient";
import { db } from "@/lib/db";

interface LoginPageProps {
  loginParams?: {
    title?: string;
    categoryId?: string;
  };
}

export default async function Page({ loginParams }: LoginPageProps) {
  const { userId } = auth();

  if (userId) {
    // 1) Pull DB user
    const user = await db.user.findUnique({ where: { clerkId: userId } });

    // 2) Prepare admin email allow-list
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // 3) Fetch Clerk user once; reuse for admin + role fallback
    let clerkUser: Awaited<
      ReturnType<typeof clerkClient.users.getUser>
    > | null = null;
    try {
      clerkUser = await clerkClient.users.getUser(userId);
    } catch {
      // ignore
    }

    // 4) Determine admin
    const dbEmail = user?.email?.toLowerCase();
    const clerkEmails =
      clerkUser?.emailAddresses
        ?.map((e) => e.emailAddress?.toLowerCase())
        .filter(Boolean) ?? [];
    const isAdminFromDbRole = user?.role === "admin";
    const isAdminFromEmails =
      (!!dbEmail && adminEmails.includes(dbEmail)) ||
      clerkEmails.some((e) => adminEmails.includes(e!));
    const isAdmin = isAdminFromDbRole || isAdminFromEmails;

    // 5) Determine teacher (DB first, then Clerk publicMetadata.role)
    const metaRole = (
      clerkUser?.publicMetadata?.role as string | undefined
    )?.toLowerCase();
    const role = (user?.role ?? metaRole ?? "").toLowerCase();
    const isTeacher = role === "teacher" || role === "instructor";

    // 6) Redirect precedence: admin → teacher → dashboard
    if (isAdmin) {
      redirect("/admin/teachers");
    }
    if (isTeacher) {
      redirect("/teacher/courses");
    }
    redirect("/dashboard");
  }

  // Guest view
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full">
        <Hero />
        <CategorySection />
        <LoginPageClient />
        <FeaturedCourses />
        <Footer />
      </div>
    </div>
  );
}
