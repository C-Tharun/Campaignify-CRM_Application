"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 px-4">
      <div className="max-w-md w-full bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
        <Image src="/favicon.ico" alt="Campaignify Logo" width={48} height={48} className="mb-4 rounded" />
        <h1 className="text-2xl font-extrabold text-blue-800 mb-2 tracking-tight">Sign in to Campaignify</h1>
        <p className="text-gray-600 mb-6 text-center text-sm">Access your dashboard and manage your campaigns securely.</p>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition mb-2"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3 15.6 3 8.1 8.6 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.6 0 10.7-1.8 14.6-4.9l-6.8-5.6C29.8 36 24 36 24 36c-5.8 0-10.7-2.9-13.7-7.2l-7 5.4C8.1 39.4 15.6 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.7 7.5-11.7 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3c-8.4 0-15.5 6.1-17.7 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3c-8.4 0-15.5 6.1-17.7 14.7z"/></g></svg>
            Sign in with Google
          </span>
        </button>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}