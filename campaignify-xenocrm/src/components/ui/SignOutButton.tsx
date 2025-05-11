"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => signOut()}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${className}`}
    >
      Sign out
    </button>
  );
} 