"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { findBestEmployee } from "@/lib/employees";
import {
  PaperAirplaneIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "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",
});

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    setSelectedTimeSlot(null);
    setShowConfirmation(false);
  };

  const handleScheduleMeeting = () => {
    if (selectedTimeSlot) {
      setShowConfirmation(true);
    }
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
      // Create streaming assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Define tools (client-side) for multi-step calling
      const tools = {
        searchEmployee: tool({
          description: 'Search internal directory for potential expert matches. Always returns the full employee list for model-side selection.',
          inputSchema: z.object({
            query: z.string().min(0),
          }),
          execute: async ({ query }) => {
            const { employees } = await import('@/lib/employees');
            return { candidates: employees, count: employees.length, query };
          },
        }),
        proposeEmployee: tool({
          description: 'Propose the single best employee to the user with a reason.',
          inputSchema: z.object({
            employeeId: z.string(),
            reason: z.string().min(5),
          }),
          execute: async ({ employeeId, reason }) => {
            const { employees } = await import('@/lib/employees');
            const emp = employees.find(e => e.id === employeeId);
            if (!emp) {
              throw new Error(`Employee with id ${employeeId} not found`);
            }
            setSelectedEmployee(emp);
            setIsSearching(true);
            setTimeout(() => {
              setIsSearching(false);
              setShowProfile(true);
            }, 10000);
            return { employee: emp, reason };
          },
        }),
      } as const;

      // Stream the response with tools
      const result = streamText({
        model: openrouter("openai/gpt-4o-2024-11-20"),
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        system: `You're chatting with Joe Raft. You're a helpful connector for colleagues.

Style:
- Relaxed and smooth, but purpose-driven. Friendly, concise, and confident.

Mission:
- Understand EXACTLY what Joe needs before making a match. Bad matches waste everyone's time.
- Extract Joe's own expertise areas when relevant for future connections.

Behavior:
- FIRST: Understand the problem. What is Joe trying to accomplish? What system/process is he working with?
- Ask 1-2 targeted clarifiers: Is this about implementation help, system knowledge, process guidance, or debugging? What specific part is blocking him?
- Only call +searchEmployee+ when you clearly understand the need. Use a precise query.
- From candidates, pick the best fit and call +proposeEmployee+ with employeeId and explain WHY this person can help with the specific problem.

Never rush to match. A good understanding saves time.`,
        temperature: 0.7,
        tools,
        stopWhen: stepCountIs(6),
        onStepFinish: ({ toolCalls, toolResults }) => {
          if ((!toolCalls || toolCalls.length === 0) && (!toolResults || toolResults.length === 0)) return;
          setMessages(prev => prev.map(msg => {
            if (msg.id !== assistantMessageId) return msg;
            const existing = msg.toolCalls ?? [];
            const appended = [...existing];
            for (const call of toolCalls ?? []) {
              const toolName = (call as any).toolName as string;
              const input = (call as any).input as any;
              if (toolName === 'searchEmployee') {
                appended.push({ type: 'searchEmployee', data: { note: `Searched` } });
              }
              if (toolName === 'proposeEmployee') {
                appended.push({ type: 'proposeEmployee', data: { employeeName: 'Proposed', reason: input?.reason } });
              }
            }
            for (const tr of toolResults ?? []) {
              const toolName = (tr as any).toolName as string;
              const output = (tr as any).output as any;
              if (toolName === 'proposeEmployee' && output) {
                const emp = output.employee;
                appended.push({ type: 'proposeEmployee', data: { employeeName: emp?.name, employee: emp, reason: output?.reason } });
                
                // Trigger the profile display with the actual employee
                if (emp) {
                  setSelectedEmployee(emp);
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
              }
            }
            return { ...msg, toolCalls: appended };
          }));
        },
      });

      let fullText = '';
      
      // Stream the text word by word
      for await (const chunk of result.textStream) {
        fullText += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullText }
            : msg
        ));
        
        // Small delay for smooth animation
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Finalize the message
      const finalText = await result.text;
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: finalText, isStreaming: false }
          : msg
      ));
    } catch (error) {
      console.error('AI Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Fallback response for connect mode
      let fallbackContent = "I understand you need help with that. Let me search for someone who can assist you.";
      let toolCalls: Array<{type: string; data: any}> = [];
      
      // Simulate the flow even on error
      if (messages.length < 2) {
        fallbackContent = "Could you provide more details about what specific help you need?";
      } else {
        fallbackContent = "Let me find the perfect person to help you with this.";
        toolCalls = [
          {
            type: 'searchEmployee',
            data: { 
              employee: { name: 'John Doe', title: 'Senior Product Designer' },
              expertise: messageText
            }
          },
          {
            type: 'proposeEmployee',
            data: { employeeName: 'John Doe', reason: 'Expert in requested area' }
          }
        ];
      }
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackContent,
        toolCalls
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (showConfirmation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Card className="border-black/10 bg-[#eeebe3]/50 p-8">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-black" />
              <h1 className="text-2xl font-bold mb-2">Meeting Confirmed</h1>
              <p className="text-muted-foreground mb-4">
                Your meeting with {selectedEmployee?.name || 'the expert'} has been scheduled for {selectedTimeSlot}.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You'll receive a calendar invitation shortly.
              </p>
              <Button onClick={handleReset} className="bg-black hover:bg-gray-800">
                Schedule Another Meeting
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
                    "Tomorrow, 4:00 PM",
                    "Tomorrow, 2:00 PM",
                    "Thursday, 10:00 AM",
                    "Thursday, 3:00 PM",
                    "Friday, 11:00 AM",
                  ].map((time) => (
                    <Button
                      key={time}
                      variant={selectedTimeSlot === time ? "default" : "outline"}
                      className={`justify-start gap-2 border-black/20 ${
                        selectedTimeSlot === time 
                          ? "bg-black text-white" 
                          : "hover:bg-black hover:text-white"
                      }`}
                      onClick={() => setSelectedTimeSlot(time)}
                    >
                      <ClockIcon className="h-4 w-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTimeSlot && (
                <div className="pt-4 border-t border-black/10">
                  <Button 
                    className="w-full gap-2 bg-black hover:bg-gray-800"
                    onClick={handleScheduleMeeting}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Meeting for {selectedTimeSlot}
                  </Button>
                </div>
              )}
              
              <div className={`${selectedTimeSlot ? 'pt-2' : 'pt-4 border-t border-black/10'}`}>
                <Button variant="outline" className="w-full gap-2">
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
                    <div 
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, message.role === 'user' 
                            ? '<code class="px-1 py-0.5 bg-white/20 rounded text-xs">$1</code>'
                            : '<code class="px-1 py-0.5 bg-black/10 rounded text-xs">$1</code>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                    
                    {/* Tool calls */}
                    {message.toolCalls && message.toolCalls.map((tool, i) => (
                      <div key={i} className="mt-2">
                        {tool.type === 'searchEmployee' && (
                          <div className="p-3 bg-white/50 rounded border">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium">Searching employees...</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <div>{tool.data.note || `Searched ${tool.data.allEmployees?.length || 5} employees`}</div>
                            </div>
                          </div>
                        )}
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