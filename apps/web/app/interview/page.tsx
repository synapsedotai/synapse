"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { VoiceInterview } from "@/components/voice-interview";
import { useAtom } from 'jotai';
import { userDataAtom } from '@/lib/atoms';

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
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [interviewMode, setInterviewMode] = useState<'chat' | 'voice' | 'video' | null>(null);
  const [user] = useAtom(userDataAtom);

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

  const handleModeSelect = (mode: 'chat' | 'voice' | 'video') => {
    setInterviewMode(mode);
    setShowModeSelector(false);
    
    // Start the interview with an initial message
    setMessages([{
      id: "initial",
      role: "assistant", 
      content: `Hello ${user?.name || 'there'}! I'm here to help you reflect on your week. Let's start with your weekly to-dos. What tasks did you plan to accomplish this week?`
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response - in real implementation, this would call your AI service
      setTimeout(() => {
        const responses = [
          "That sounds like great progress! What challenges did you face this week?",
          "Interesting! Can you tell me more about what you learned?",
          "How did that make you feel? What would you do differently next time?",
          "That's a valuable insight. Who else in the company might benefit from knowing this?",
          "Excellent work! What are you planning to focus on next week?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response
        }]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Interview error:', error);
      setIsLoading(false);
    }
  };

  const handleCompletionConfirm = () => {
    setShowCompletionDialog(false);
    // In real implementation, this would save the completion state
  };

  if (showModeSelector) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Weekly Interview</h1>
          <p className="text-muted-foreground">
            How would you like to conduct your weekly reflection?
          </p>
        </div>
        
        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={() => handleModeSelect('chat')}
            variant="outline"
            className="w-full h-20 flex items-center gap-4 justify-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-base">Text Chat</div>
              <div className="text-sm text-muted-foreground">Type your responses at your own pace</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleModeSelect('voice')}
            variant="outline"
            className="w-full h-20 flex items-center gap-4 justify-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <MicrophoneIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-base">Voice Call</div>
              <div className="text-sm text-muted-foreground">Speak naturally with AI interviewer</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleModeSelect('video')}
            variant="outline"
            className="w-full h-20 flex items-center gap-4 justify-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <VideoCameraIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-base">Video Meeting</div>
              <div className="text-sm text-muted-foreground">Face-to-face conversation with AI</div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  // Voice mode with ElevenLabs
  if (interviewMode === 'voice') {
    return <VoiceInterview onBack={() => setShowModeSelector(true)} />;
  }

  // Video mode placeholder
  if (interviewMode === 'video') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoCameraIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Video Interview</h1>
          <p className="text-muted-foreground mb-6">
            Video interview functionality coming soon
          </p>
          <Button variant="outline" onClick={() => setShowModeSelector(true)}>
            Back to Mode Selection
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
            Reflect on your week with AI-guided questions • {interviewMode} mode
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
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#eeebe3] text-black rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
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
