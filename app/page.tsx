// Server Component: no "use client"
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Hero from "@/components/udemy-clone/Hero";
import CategorySection from "@/components/udemy-clone/CategorySection";
import FeaturedCourses from "@/components/udemy-clone/FeaturedCourses";
import Footer from "@/components/udemy-clone/Footer";
import LoginPageClient from "./_components/LoginPageClient";
import { db } from "@/lib/db";

// Optional: if you plan to show courses only to signed-in users, fetch them after auth,
// or skip fetching entirely for guests. Here we redirect signed-in users immediately.
interface LoginPageProps {
  loginParams?: {
    title?: string;
    categoryId?: string;
  };
}

export default async function Page({ loginParams }: LoginPageProps) {
  const { userId } = auth();

  // If the user is signed in, route admins to admin panel, others to dashboard
  if (userId) {
    const user = await db.user.findUnique({ where: { clerkId: userId } });

    // Admin by DB role or ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    let isAdmin =
      user?.role === "admin" ||
      (!!user?.email && adminEmails.includes(user.email.toLowerCase()));

    if (!isAdmin) {
      try {
        const cu = await clerkClient.users.getUser(userId);
        const emails = (cu.emailAddresses || [])
          .map((e) => e.emailAddress?.toLowerCase())
          .filter(Boolean) as string[];
        isAdmin = emails.some((e) => adminEmails.includes(e));
      } catch {}
    }

    if (isAdmin) {
      redirect("/admin/teachers");
    }

    redirect("/dashboard");
  }

  // Guest view
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full">
        <Hero />
        <CategorySection />
        {/* If you really need courses for guests, fetch them via a server action here
            and pass to a client child for rendering. Otherwise, keep it simple. */}
        <LoginPageClient />
        <FeaturedCourses />
        <Footer />
      </div>
    </div>
  );
}
