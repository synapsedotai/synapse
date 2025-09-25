"use client";

import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { Sidebar } from "@/components/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { MobileDrawer } from "@/components/mobile-drawer";
import { NexusMobileDrawer } from "@/components/nexus-mobile-drawer";
import { isUserLoggedInAtom, isNexusLoggedInAtom } from "@/lib/atoms";

interface AppContentProps {
  children: React.ReactNode;
}

const authRoutes = ['/login', '/nexus'];

export function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const [isUserLoggedIn] = useAtom(isUserLoggedInAtom);
  const [isNexusLoggedIn] = useAtom(isNexusLoggedInAtom);
  
  const isAuthRoute = authRoutes.includes(pathname);
  const isNexusPath = pathname.startsWith('/nexus');
  
  // Show auth pages without sidebar
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // Show nexus app with nexus sidebar
  if (isNexusPath && isNexusLoggedIn) {
    return (
      <div className="flex h-screen bg-white">
        {/* Desktop Nexus Sidebar */}
        <div className="hidden md:flex h-full w-64 flex-shrink-0">
          <NexusSidebar />
        </div>
        
        {/* Mobile Nexus Drawer */}
        <NexusMobileDrawer />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }
  
  // Show user app with user sidebar
  if (isUserLoggedIn) {
    return (
      <div className="flex h-screen bg-white">
        {/* Desktop User Sidebar */}
        <div className="hidden md:flex h-full w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Mobile User Drawer */}
        <MobileDrawer />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }
  
  // Fallback for unauthenticated users
  return <>{children}</>;
}
