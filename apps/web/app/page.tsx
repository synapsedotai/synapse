"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { isUserLoggedInAtom } from "@/lib/atoms";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn] = useAtom(isUserLoggedInAtom);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}