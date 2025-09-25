"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HoverTooltipProps {
  profile: any;
  position: { x: number; y: number };
  visible: boolean;
}

export function HoverTooltip({ profile, position, visible }: HoverTooltipProps) {
  if (!visible || !profile) return null;

  const levelColors = {
    'CEO': 'bg-purple-100 text-purple-800',
    'C-Suite': 'bg-purple-100 text-purple-800',
    'Director': 'bg-red-100 text-red-800',
    'Senior Manager': 'bg-orange-100 text-orange-800',
    'Team Lead': 'bg-green-100 text-green-800',
    'Senior IC': 'bg-blue-100 text-blue-800',
    'Mid IC': 'bg-indigo-100 text-indigo-800',
    'Junior IC': 'bg-gray-100 text-gray-800'
  }[profile.level] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-sm font-semibold">
              {profile.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{profile.name}</div>
            <div className="text-xs text-muted-foreground truncate">{profile.role}</div>
            <div className="flex gap-1 mt-1">
              <Badge className={`${levelColors} text-xs px-1 py-0`}>
                {profile.level}
              </Badge>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {profile.department}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          Click for full profile
        </div>
      </div>
    </div>
  );
}
