"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { userDataAtom, userLogoutAtom } from "@/lib/atoms";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAtom(userDataAtom);
  const [, logout] = useAtom(userLogoutAtom);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
    { name: "Interview", href: "/interview", icon: ChatBubbleLeftRightIcon },
    { name: "Connect", href: "/connect", icon: ArrowsRightLeftIcon },
    { name: "Meetings", href: "/meetings", icon: CalendarDaysIcon },
  ];

  // Mock weekly interview completion status
  const hasCompletedInterview = false; // In real app, this would check completion state

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-synapse-beige", className)}>
      {/* Logo */}
      <div className="p-4">
        <Link href="/" className="flex flex-col items-center justify-center" onClick={handleNavClick}>
          <Image
            src="/synapse-logo.png"
            alt="Synapse"
            width={150}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <Separator className="bg-black/10" />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            {user?.avatar && (
              <AvatarImage src={user.avatar} alt={user.name} />
            )}
            <AvatarFallback className="bg-white text-black">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {user?.email || 'user@example.com'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const showPending = item.name === "Interview" && !hasCompletedInterview;
          
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
                {showPending && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    Pending
                  </Badge>
                )}
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
          Synapse © 2025
        </div>
      </div>
    </div>
  );
}
