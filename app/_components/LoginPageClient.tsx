"use client";

import { useEffect } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPageClient() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="mt-8 flex flex-col items-center mb-8">
      <h1 className="text-2xl font-bold mb-6">Welcome! Please Sign In</h1>

      {/* Sign in box */}
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <p className="mb-4 text-center text-gray-600">
          Access your account securely
        </p>
        <div className="flex justify-center">
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
