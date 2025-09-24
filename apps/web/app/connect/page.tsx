"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PaperAirplaneIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";

// Mock employee data
const mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    title: "Senior Product Designer",
    office: "San Francisco Office",
    department: "Product Design Team - Platform Squad",
    experience: "5+ years in UX/UI Design",
    building: "Building 3, Floor 4",
    about: "Led the migration of our design system to the new component library. Deep knowledge of our internal tools, CI/CD pipeline, and frontend architecture. Happy to share knowledge about our design tokens, component patterns, and best practices for cross-team collaboration.",
    expertise: [
      "Design System v2.0",
      "Component Library", 
      "Internal APIs",
      "Frontend Architecture",
      "CI/CD Pipeline"
    ]
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  toolCalls?: Array<{
    type: string;
    data: any;
  }>;
}

export default function ConnectPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleReset = () => {
    setShowProfile(false);
    setIsSearching(false);
    setInput("");
    setMessages([]);
    setSelectedEmployee(null);
    setRedirectCountdown(0);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response for expert matching
      setTimeout(() => {
        if (messages.length < 2) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Could you provide more details about what specific help you need? For example, is this about implementation, system knowledge, or process guidance?"
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Perfect! Let me find the ideal person to help you with this. Searching our expert network...",
            toolCalls: [{
              type: 'proposeEmployee',
              data: { 
                employeeName: 'John Doe',
                employee: mockEmployees[0],
                reason: 'Expert in the requested area'
              }
            }]
          }]);
          
          // Simulate finding expert
          setSelectedEmployee(mockEmployees[0]);
          setIsSearching(true);
          setRedirectCountdown(10);
          
          const timer = setInterval(() => {
            setRedirectCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                setIsSearching(false);
                setShowProfile(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Connect error:', error);
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (showProfile) {
    return (
      <div className="flex h-full flex-col p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Perfect Match Found</h1>
          <p className="text-muted-foreground">
            We found a colleague who can help with your request
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-black/10">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-[#eeebe3] text-xl">
                  {selectedEmployee?.name?.split(' ').map((n: string) => n[0]).join('') || 'JD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{selectedEmployee?.name || 'John Doe'}</h2>
                <p className="text-muted-foreground">{selectedEmployee?.title || 'Senior Product Designer'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEmployee?.office || 'San Francisco Office'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEmployee?.department || 'Product Design Team - Platform Squad'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEmployee?.experience || '5+ years in UX/UI Design'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEmployee?.building || 'Building 3, Floor 4'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium">About</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEmployee?.about || 'Led the migration of our design system to the new component library. Deep knowledge of our internal tools, CI/CD pipeline, and frontend architecture. Happy to share knowledge about our design tokens, component patterns, and best practices for cross-team collaboration.'}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(selectedEmployee?.expertise || [
                  "Design System v2.0",
                  "Component Library", 
                  "Internal APIs",
                  "Frontend Architecture",
                  "CI/CD Pipeline"
                ]).map(
                  (tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#eeebe3] px-3 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-black/10">
            <h3 className="mb-4 text-lg font-semibold">Schedule a Meeting</h3>
            
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {selectedEmployee?.name?.split(' ')[0] || 'John'} is available for a 30-minute chat
                </p>
                <div className="grid gap-2">
                  {[
                    "Tomorrow, 2:00 PM",
                    "Thursday, 10:00 AM",
                    "Thursday, 3:00 PM",
                    "Friday, 11:00 AM",
                  ].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="justify-start gap-2 border-black/20"
                    >
                      <ClockIcon className="h-4 w-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-black/10">
                <Button className="w-full gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Request Custom Time
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Button variant="secondary" onClick={handleReset}>
            Find Another Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden flex-col p-4 sm:p-8">
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold">Connect</h1>
        <p className="text-muted-foreground">
          Find colleagues with the expertise you need
        </p>
      </div>

      <Card className="flex flex-col flex-1 min-h-0 max-w-3xl w-full border-black/10 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="mb-2 text-lg font-medium">
                What do you need help with?
              </h3>
              <p className="text-sm text-muted-foreground">
                Describe what internal knowledge, system, or process you need help with.
                I'll connect you with a colleague who has the expertise.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-black text-white"
                        : "bg-[#eeebe3] text-black"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {/* Tool calls */}
                    {message.toolCalls && message.toolCalls.map((tool, i) => (
                      <div key={i} className="mt-2">
                        {tool.type === 'proposeEmployee' && (
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium">Perfect match found!</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <div>Proposing: {tool.data.employeeName}</div>
                              {redirectCountdown > 0 && (
                                <div className="mt-2 text-blue-600 font-medium">
                                  Redirecting to specialist in {redirectCountdown}s...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {isSearching && (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="h-6 w-6 animate-spin text-black" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing your request and finding the perfect match...
                    </p>
                    {redirectCountdown > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Redirecting to specialist in {redirectCountdown}s...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          </ScrollArea>
        </div>

        <div className="border-t border-black/10 p-3 sm:p-4 flex-shrink-0">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messages.length === 0 
                    ? "e.g., I need help understanding our microservices architecture..."
                    : "Type your response..."
                }
                className="flex-1 border-black/20 focus:border-black"
                disabled={isSearching || isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSearching || isLoading || input.length === 0}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {messages.length === 0 && (
            <div className="mt-4 pt-4 border-t border-black/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Quick prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Need help with our internal API documentation",
                  "Looking for someone who knows our deployment process",
                  "Who can explain our design system components?",
                  "Need expertise on our data pipeline architecture",
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-black/20"
                    onClick={() => handleQuickPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>
    );
  }
