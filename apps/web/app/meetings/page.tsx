"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  VideoCameraIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { SiGooglemeet } from "@icons-pack/react-simple-icons";

// Mock meeting data
const liveMeeting = {
  id: "live-1",
  name: "Nick Expert",
  role: "Domain Expert",
  topic: "Domain DNS Setup",
  startTime: "4:00 PM",
  duration: "30 min",
  type: "video",
  status: "about-to-start",
  joinUrl: "https://meet.google.com/jec-ztpb-rss"
};

const upcomingMeetings = [
  {
    id: 1,
    name: "Sarah Kim",
    role: "Senior Frontend Engineer", 
    topic: "React component architecture",
    time: "Tomorrow, 10:00 AM",
    duration: "30 min",
    type: "video"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Data Scientist",
    topic: "ML pipeline optimization",
    time: "Next Week, Tuesday 2:00 PM",
    duration: "45 min", 
    type: "voice"
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "UX Researcher",
    topic: "User testing methodology",
    time: "Next Week, Thursday 3:00 PM",
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
  const [meetingState, setMeetingState] = useState<'about-to-start' | 'active' | 'rating' | 'completed'>('about-to-start');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">
          Manage your expert knowledge sharing sessions
        </p>
      </div>

      {/* Current Meeting Alert */}
      {meetingState === 'about-to-start' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <SiGooglemeet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">About to Start</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      4PM
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    {liveMeeting.name} • {liveMeeting.topic}
                  </p>
                  <p className="text-xs text-blue-600">
                    Scheduled for {liveMeeting.startTime} • {liveMeeting.duration}
                  </p>
                </div>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  window.open(liveMeeting.joinUrl, '_blank');
                  setMeetingState('active');
                }}
              >
                <SiGooglemeet className="h-4 w-4 mr-2" />
                Join Google Meet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {meetingState === 'active' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <SiGooglemeet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Google Meet is active in a new tab</h3>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      ACTIVE
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    {liveMeeting.name} • {liveMeeting.topic}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => window.open(liveMeeting.joinUrl, '_blank')}
                >
                  Reopen Here
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setMeetingState('rating')}
                >
                  End Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {meetingState === 'rating' && (
        <Card className="border-black/10 bg-[#eeebe3]/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">How was your meeting?</h3>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <StarIcon 
                      className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add a comment about the meeting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-black/20 rounded-lg resize-none bg-white focus:border-black"
                rows={3}
              />
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => setMeetingState('completed')}
                disabled={rating === 0}
              >
                Submit Rating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {meetingState === 'completed' && (
        <Card className="border-black/10 bg-[#eeebe3]/50">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-black" />
              <h3 className="text-lg font-semibold">Thank you for your feedback</h3>
              <p className="text-sm text-muted-foreground">Your meeting rating has been submitted successfully.</p>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="flex items-center gap-1">
                      {[...Array(meeting.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-3 h-3 text-yellow-400" />
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
