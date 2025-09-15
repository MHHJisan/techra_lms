// Server Component: no "use client"
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Hero from "@/components/udemy-clone/Hero";
import CategorySection from "@/components/udemy-clone/CategorySection";
import FeaturedCourses from "@/components/udemy-clone/FeaturedCourses";
import Footer from "@/components/udemy-clone/Footer";
import LoginPageClient from "./_components/LoginPageClient";

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

  // If the user is signed in, go to the dashboard on the server (no CLS).
  if (userId) {
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
