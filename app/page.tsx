// Server Component: no "use client"
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Hero from "@/components/udemy-clone/Hero";
import Stats from "@/components/home/Stats";
import CategorySection from "@/components/udemy-clone/CategorySection";
import FeaturedCourses from "@/components/udemy-clone/FeaturedCourses";
import Testimonials from "@/components/home/Testimonials";
import FinalCta from "@/components/home/FinalCta";
import { db } from "@/lib/db";
import UdemyStyleNavbar from "@/components/udemy-clone/UdemyStyleNavbar";

interface LoginPageProps {
  searchParams?: {
    categoryId?: string;
    q?: string;
  };
}

export default async function Page({ searchParams }: LoginPageProps) {
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

    // 3.5) Ensure local User profile is up-to-date with Clerk (no migration approach)
    if (clerkUser) {
      const primaryEmail =
        user?.email ||
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        undefined;

      await db.user.upsert({
        where: { clerkId: userId },
        update: {
          email: primaryEmail ?? user?.email ?? undefined,
          firstName: clerkUser.firstName ?? user?.firstName ?? undefined,
          lastName: clerkUser.lastName ?? user?.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? user?.imageUrl ?? undefined,
        },
        create: {
          clerkId: userId,
          email: primaryEmail || "",
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
        },
      });
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
    <div className="w-full">
      <UdemyStyleNavbar />
      <FeaturedCourses
        categoryId={searchParams?.categoryId}
        q={searchParams?.q}
      />
      {/* <Hero /> */}
      <CategorySection />
      <Stats />
      <Testimonials />
      <FinalCta />
    </div>
  );
}
