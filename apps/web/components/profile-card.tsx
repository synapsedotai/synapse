"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

interface ProfileData {
  id: string;
  name: string;
  role: string;
  department: string;
  level: string;
  avatar?: string;
  email: string;
  age: number;
  compensation: string;
  startDate: string;
  location: string;
  reports: number;
  skills: string[];
  performance: 'Exceeds' | 'Meets' | 'Below';
}

interface ProfileCardProps {
  profile: ProfileData | null;
  open: boolean;
  onClose: () => void;
}

export function ProfileCard({ profile, open, onClose }: ProfileCardProps) {
  if (!profile) return null;

  const performanceColor = {
    'Exceeds': 'bg-green-100 text-green-800',
    'Meets': 'bg-blue-100 text-blue-800', 
    'Below': 'bg-red-100 text-red-800'
  }[profile.performance];

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-lg font-semibold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div>
                <DialogTitle className="text-xl font-bold">{profile.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={levelColors}>
                  {profile.level}
                </Badge>
                <Badge variant="outline">
                  {profile.department}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Info */}
          <div>
            <h3 className="font-semibold mb-2">Professional</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span>{profile.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span>{profile.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compensation:</span>
                <span className="font-medium">{profile.compensation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direct Reports:</span>
                <span>{profile.reports}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance */}
          <div>
            <h3 className="font-semibold mb-2">Performance</h3>
            <Badge className={performanceColor}>
              {profile.performance} Expectations
            </Badge>
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className="font-semibold mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
