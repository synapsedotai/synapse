"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { isNexusLoggedInAtom } from "@/lib/atoms";

interface NexusAuthProviderProps {
  children: React.ReactNode;
}

const nexusRoutes = ['/nexus/dashboard', '/nexus/overview', '/nexus/insights'];

export function NexusAuthProvider({ children }: NexusAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNexusLoggedIn] = useAtom(isNexusLoggedInAtom);

  useEffect(() => {
    // Only handle nexus routes
    if (!pathname.startsWith('/nexus')) {
      return; // Let user auth handle non-nexus routes
    }

    // Handle nexus login page  
    if (pathname === '/nexus') {
      if (isNexusLoggedIn) {
        router.push('/nexus/dashboard');
      }
      return;
    }

    // Handle nexus protected routes
    if (nexusRoutes.includes(pathname) && !isNexusLoggedIn) {
      router.push('/nexus');
      return;
    }

  }, [isNexusLoggedIn, pathname, router]);

  return <>{children}</>;
}
