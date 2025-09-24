"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

// Mock meeting data
const liveMeeting = {
  id: "live-1",
  name: "Alex Rodriguez",
  role: "Senior DevOps Engineer",
  topic: "Kubernetes deployment strategies",
  startTime: "2:30 PM",
  duration: "30 min",
  type: "video",
  status: "live",
  joinUrl: "#"
};

const upcomingMeetings = [
  {
    id: 1,
    name: "Sarah Kim",
    role: "Senior Frontend Engineer", 
    topic: "React component architecture",
    time: "Today, 4:00 PM",
    duration: "30 min",
    type: "video"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Data Scientist",
    topic: "ML pipeline optimization",
    time: "Tomorrow, 10:00 AM",
    duration: "45 min", 
    type: "voice"
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "UX Researcher",
    topic: "User testing methodology",
    time: "Thursday, 3:00 PM",
    duration: "30 min",
    type: "chat"
  }
];

const pastMeetings = [
  {
    id: 1,
    name: "David Chen",
    role: "Principal Engineer",
    topic: "Microservices architecture deep dive",
    date: "Yesterday, 2:00 PM",
    duration: "45 min",
    type: "video",
    rating: 5,
    notes: "Excellent session on service mesh implementation"
  },
  {
    id: 2,
    name: "Lisa Zhang",
    role: "Product Manager",
    topic: "Product roadmap planning",
    date: "Monday, 11:00 AM", 
    duration: "30 min",
    type: "voice",
    rating: 4,
    notes: "Great insights on prioritization frameworks"
  },
  {
    id: 3,
    name: "James Taylor",
    role: "Design Lead",
    topic: "Design system implementation",
    date: "Last Friday, 3:30 PM",
    duration: "30 min",
    type: "chat",
    rating: 5,
    notes: "Comprehensive overview of component library"
  }
];

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="h-4 w-4" />;
      case 'voice': return <PhoneIcon className="h-4 w-4" />;
      case 'chat': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'voice': return 'bg-green-100 text-green-700';
      case 'chat': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">
          Manage your expert knowledge sharing sessions
        </p>
      </div>

      {/* Live Meeting Alert */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <PlayIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Meeting in Progress</h3>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    LIVE
                  </Badge>
                </div>
                <p className="text-sm text-green-700">
                  {liveMeeting.name} • {liveMeeting.topic}
                </p>
                <p className="text-xs text-green-600">
                  Started at {liveMeeting.startTime} • {liveMeeting.duration}
                </p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <VideoCameraIcon className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('past')}
        >
          Past Meetings
        </Button>
      </div>

      {/* Upcoming Meetings */}
      {activeTab === 'upcoming' && (
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Upcoming Expert Sessions</CardTitle>
            <CardDescription>
              Your scheduled knowledge sharing meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#eeebe3] text-black font-medium">
                    {meeting.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{meeting.name}</h4>
                    <Badge className={getMeetingTypeColor(meeting.type)} variant="secondary">
                      {getMeetingIcon(meeting.type)}
                      <span className="ml-1 capitalize">{meeting.type}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{meeting.role}</p>
                  <p className="text-sm font-medium">{meeting.topic}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{meeting.time} • {meeting.duration}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Reschedule
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Meetings */}
      {activeTab === 'past' && (
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Meeting History</CardTitle>
            <CardDescription>
              Your completed expert knowledge sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#eeebe3] text-black font-medium">
                    {meeting.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{meeting.name}</h4>
                    <Badge className={getMeetingTypeColor(meeting.type)} variant="secondary">
                      {getMeetingIcon(meeting.type)}
                      <span className="ml-1 capitalize">{meeting.type}</span>
                    </Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(meeting.rating)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{meeting.role}</p>
                  <p className="text-sm font-medium">{meeting.topic}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{meeting.date} • {meeting.duration}</span>
                  </div>
                  {meeting.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">"{meeting.notes}"</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    View Notes
                  </Button>
                  <Button variant="outline" size="sm">
                    Book Again
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
