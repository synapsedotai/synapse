"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  ChartBarIcon,
  SparklesIcon,
  ViewfinderCircleIcon,
  ArrowRightStartOnRectangleIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { nexusDataAtom, nexusLogoutAtom } from "@/lib/atoms";

interface NexusSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function NexusSidebar({ className, onNavigate }: NexusSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAtom(nexusDataAtom);
  const [, logout] = useAtom(nexusLogoutAtom);

  const navigation = [
    { name: "Dashboard", href: "/nexus/dashboard", icon: ChartBarIcon },
    { name: "Overview", href: "/nexus/overview", icon: ViewfinderCircleIcon },
    { name: "Insights", href: "/nexus/insights", icon: SparklesIcon },
  ];

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/nexus');
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-synapse-beige", className)}>
      {/* Logo with Nexus Badge */}
      <div className="p-4 pt-6">
        <Link href="/nexus" className="flex flex-col items-center justify-center" onClick={handleNavClick}>
          <Image
            src="/synapse-logo.png"
            alt="Synapse"
            width={150}
            height={40}
            className="object-contain"
            priority
          />
          <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full flex items-center gap-2">
            <BoltIcon className="w-4 h-4" />
            <span className="tracking-widest">N E X U S</span>
          </div>
        </Link>
      </div>

      <Separator className="bg-black/10" />

      {/* Executive Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            {user?.avatar && (
              <AvatarImage src={user.avatar} alt={user.name} />
            )}
            <AvatarFallback className="bg-white text-black">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.name || 'Executive'}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {user?.email || 'exec@synapse.com'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href} onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between gap-3 transition-colors hover:bg-white/40",
                  isActive && "bg-white text-black hover:bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          <span>Log out</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="text-center text-xs text-muted-foreground">
          Synapse Nexus © 2025
        </div>
      </div>
    </div>
  );
}
