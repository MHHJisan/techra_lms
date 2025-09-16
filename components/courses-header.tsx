"use client";

import { UserButton, SignedIn } from "@clerk/nextjs";

const CoursesHeader = () => {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <h1 className="text-xl md:text-2xl font-semibold">
            Techra Learning Center
          </h1>
        </div>
      </div>
    </header>
  );
};

export default CoursesHeader;
