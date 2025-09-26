"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import confetti from 'canvas-confetti';
import { useAtom } from 'jotai';
import { userDataAtom } from '@/lib/atoms';

// OpenRouter client will be initialized after fetching config
let openrouter: any;

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

export default function InterviewPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState("");
  const [user] = useAtom(userDataAtom);
  const [hasCompletedInterview, setHasCompletedInterview] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Initialize OpenRouter client with config from API
  useEffect(() => {
    const initializeOpenRouter = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (config.openrouter?.apiKey) {
          openrouter = createOpenRouter({
            apiKey: config.openrouter.apiKey,
          });
          setConfigLoaded(true);
        } else {
          console.error('OpenRouter API key not found in config');
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    initializeOpenRouter();
  }, []);

  // Show initial message on load
  useEffect(() => {
    if (!hasCompletedInterview) {
      setMessages([{
        id: "initial",
        role: "assistant", 
        content: `Hello ${user?.name || 'there'}! I'm here to help you reflect on your week. Let's start with your weekly to-dos. What tasks did you plan to accomplish this week?`
      }]);
    }
  }, [user?.name, hasCompletedInterview]);

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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !configLoaded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
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

      // Define tools (AI SDK) for multi-step tool calling
      const tools = {
        memorizeUserInfo: tool({
          description: 'Persist rarely and only when hearing new, long-term personal info about the user (e.g., hobbies, durable preferences). Use sparingly.',
          inputSchema: z.object({
            category: z.enum(['hobby', 'preference', 'insight']).describe('Type of info; use insight for durable personal insights'),
            content: z.string().min(5).max(280).describe('Concise memory to store'),
          }),
          execute: async ({ category, content }) => {
            try {
              const key = 'synapse_memories';
              const existingRaw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
              const existing = existingRaw ? JSON.parse(existingRaw) : [];
              const entry = { ts: Date.now(), category, content, policy: 'rare' };
              const next = [entry, ...existing].slice(0, 20);
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(next));
              }
              return { status: 'saved', entry };
            } catch {
              return { status: 'skipped' };
            }
          },
        }),
        endInterview: tool({
          description: 'Finish the weekly reflection by returning a concise summary and optional recommendations.',
          inputSchema: z.object({
            summary: z.string().min(20).describe('Concise summary of the week in 3-6 sentences'),
            recommendations: z.array(z.string()).optional().describe('Up to 3 actionable next steps'),
          }),
          execute: async ({ summary, recommendations }) => {
            setInterviewSummary(summary);
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#000000', '#eeebe3', '#ffffff']
              });
              setShowCompletionDialog(true);
            }, 500);
            return { completed: true, summary, recommendations: recommendations ?? [] };
          },
        }),
      } as const;

      // Stream the response with tools and multi-step handling
      const result = streamText({
        model: openrouter("anthropic/claude-3.5-sonnet"),
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        system: `You're chatting with Joe Raft. You're a weekly reflection partner focused on extracting actionable insights.

Style:
- Relaxed and human, but purposeful. Friendly, concise, and enterprise-smooth.

Mission:
- Extract what Joe ACTUALLY did this week, not generic updates. Get specifics.
- Identify Joe's growing expertise areas: What systems did he master? What problems can he now solve for others?
- Surface patterns: recurring blockers, successful strategies, knowledge gaps.

Behavior:
- Start broad: "What were your main focuses this week?" Then drill into specifics.
- For each accomplishment: What was hard about it? What did you learn? Who else needs this knowledge?
- For each blocker: Is this a pattern? Who could have helped? What would prevent this next time?
- Push for metrics when relevant: time saved, bugs prevented, people helped.
- When you hear NEW personal/hobby info, rarely call +memorizeUserInfo+.
- After 4-6 meaningful exchanges, call +endInterview+ with a summary highlighting expertise areas and 3 actionable next steps.

Never accept vague answers. "Worked on the API" → "Which endpoints? What was the challenge?"`,
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
              if (toolName === 'memorizeUserInfo') {
                appended.push({ type: 'weeklyInsight', data: { note: input?.content } });
              }
              if (toolName === 'endInterview') {
                appended.push({ type: 'endInterview', data: { summary: input?.summary, recommendations: input?.recommendations ?? [] } });
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
      
      // Fallback response based on user input - be more natural
      let fallbackContent = "I understand. Could you tell me more about that?";
      
      if (input.toLowerCase().includes('hi') || input.toLowerCase().includes('hello')) {
        fallbackContent = "Hi there! How has your week been going so far?";
      } else if (input.toLowerCase().includes('todo') || input.toLowerCase().includes('task')) {
        fallbackContent = "That sounds like good progress! What challenges did you face this week?";
      } else if (input.toLowerCase().includes('challenge') || input.toLowerCase().includes('difficult')) {
        fallbackContent = "That does sound challenging. How did you handle it?";
      } else if (input.toLowerCase().includes('accomplish') || input.toLowerCase().includes('complete')) {
        fallbackContent = "Great work! What are you planning to focus on next week?";
      }
      
      // Only add tool calls for substantial work content
      const isWorkRelated = input.toLowerCase().match(/(task|project|work|challenge|accomplish|goal|deadline|meeting|client)/);
      const toolCalls = (isWorkRelated && input.length > 15) ? [{
        type: 'memorize',
        data: { category: 'insight', content: input }
      }] : [];
      
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

  const handleCompletionConfirm = () => {
    setHasCompletedInterview(true);
    setShowCompletionDialog(false);
  };

  if (hasCompletedInterview) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground">
            You've completed your weekly interview. Thank you for your insights!
          </p>
          <Button 
            className="mt-4" 
            onClick={() => setHasCompletedInterview(false)}
          >
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen max-h-screen overflow-hidden flex-col p-4 sm:p-8">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold">Weekly Interview</h1>
          <p className="text-muted-foreground">
            Reflect on your week with AI-guided questions
          </p>
        </div>

        <Card className="flex flex-col flex-1 min-h-0 border-black/10 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
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
                      {tool.type === 'weeklyInsight' && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium">Weekly insight noted</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {tool.data.note}
                          </div>
                        </div>
                      )}
                      {tool.type === 'endInterview' && (
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium">Interview completed!</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>Summary: {tool.data.summary}</div>
                            {tool.data?.recommendations && Array.isArray(tool.data.recommendations) && tool.data.recommendations.length > 0 && (
                              <div className="mt-1">
                                Recommendations: {tool.data.recommendations.join(', ')}
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
          </div>
        </ScrollArea>
        </div>

        <div className="border-t border-black/10 p-3 sm:p-4 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 border-black/20 focus:border-black"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={input.length === 0 || isLoading}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Interview Complete!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Thank you for completing your weekly reflection. Your insights have been recorded and will help improve your professional development.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center pt-4">
            <Button onClick={handleCompletionConfirm} className="px-8">
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}