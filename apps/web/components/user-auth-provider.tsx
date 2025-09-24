"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { isUserLoggedInAtom } from "@/lib/atoms";

interface UserAuthProviderProps {
  children: React.ReactNode;
}

const userRoutes = ['/dashboard', '/interview', '/connect', '/meetings'];

export function UserAuthProvider({ children }: UserAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isUserLoggedIn] = useAtom(isUserLoggedInAtom);

  useEffect(() => {
    // Only handle user routes and root
    if (pathname.startsWith('/nexus')) {
      return; // Let nexus handle its own routes
    }

    // Handle root redirects
    if (pathname === '/') {
      if (isUserLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    // Handle user login page
    if (pathname === '/login') {
      if (isUserLoggedIn) {
        router.push('/dashboard');
      }
      return;
    }

    // Handle user protected routes
    if (userRoutes.includes(pathname) && !isUserLoggedIn) {
      router.push('/login');
      return;
    }

  }, [isUserLoggedIn, pathname, router]);

  return <>{children}</>;
}
