"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ExclamationTriangleIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

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
  knowledgeDomains: string[];
  impactRating: number;
  expertMeetings: number;
  retentionRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: string[];
}

interface ProfileCardProps {
  profile: ProfileData | null;
  open: boolean;
  onClose: () => void;
}

export function ProfileCard({ profile, open, onClose }: ProfileCardProps) {
  const router = useRouter();
  
  if (!profile) return null;

  const riskColor = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  }[profile.retentionRisk];
  
  const handleViewRetentionStrategy = () => {
    onClose();
    // Use a URL-safe version of the name as the highlight parameter
    const highlightId = profile.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/nexus/insights?highlight=${highlightId}`);
  };

  const impactColor = profile.impactRating >= 80 ? 'bg-green-100 text-green-800' :
                     profile.impactRating >= 60 ? 'bg-blue-100 text-blue-800' :
                     'bg-gray-100 text-gray-800';

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

          {/* Impact & Expert Status */}
          <div>
            <h3 className="font-semibold mb-2">Impact Rating</h3>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={impactColor}>
                {profile.impactRating}/100 Impact Score
              </Badge>
              <span className="text-sm text-muted-foreground">
                {profile.expertMeetings} expert meetings conducted
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Based on knowledge sharing frequency and colleague feedback
            </p>
          </div>

          <Separator />

          {/* Knowledge Domains */}
          <div>
            <h3 className="font-semibold mb-2">Knowledge Domains</h3>
            <div className="flex flex-wrap gap-1">
              {profile.knowledgeDomains.map((domain, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {domain}
                </Badge>
              ))}
            </div>
          </div>

          {/* HR Alert */}
          {profile.retentionRisk !== 'Low' && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
                  Retention Alert
                </h3>
                <Badge className={`${riskColor} mb-2`}>
                  {profile.retentionRisk} Risk
                </Badge>
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  {profile.riskFactors.map((factor, index) => (
                    <div key={index}>• {factor}</div>
                  ))}
                </div>
                
                {/* Show more details button for high-risk employees like Nick Expert */}
                {(profile.name === 'Nick Expert' || profile.retentionRisk === 'Critical') && (
                  <Button 
                    onClick={handleViewRetentionStrategy}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 group"
                  >
                    <span>More Details</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
