"use client";

import { useState, useEffect } from "react";
import { useConversation } from '@elevenlabs/react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAtom } from "jotai";
import { userDataAtom } from "@/lib/atoms";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  StopIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

interface VoiceInterviewProps {
  onBack: () => void;
}

export function VoiceInterview({ onBack }: VoiceInterviewProps) {
  const [user] = useAtom(userDataAtom);
  const [hasStarted, setHasStarted] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  // ElevenLabs conversation hook
  const conversation = useConversation({
    overrides: {
      agent: {
        prompt: {
          prompt: `You're chatting with ${user?.name || 'the user'}. You're a weekly reflection partner focused on extracting actionable insights.

Style:
- Relaxed and human, but purposeful. Friendly, concise, and enterprise-smooth.

Mission:
- Extract what ${user?.name || 'the user'} ACTUALLY did this week, not generic updates. Get specifics.
- Identify their growing expertise areas: What systems did they master? What problems can they now solve for others?
- Surface patterns: recurring blockers, successful strategies, knowledge gaps.

Behavior:
- Start broad: "What were your main focuses this week?" Then drill into specifics.
- For each accomplishment: What was hard about it? What did you learn? Who else needs this knowledge?
- For each blocker: Is this a pattern? Who could have helped? What would prevent this next time?
- Push for metrics when relevant: time saved, bugs prevented, people helped.
- After 4-6 meaningful exchanges, summarize key expertise areas and provide 3 actionable next steps.

Never accept vague answers. "Worked on the API" → "Which endpoints? What was the challenge?"`
        },
        firstMessage: `Hello ${user?.name || 'there'}! I'm here to help you reflect on your week through our voice conversation. Let's start with your weekly goals - what tasks did you plan to accomplish this week?`,
        language: 'en'
      }
    }
  });

  // Check microphone permission more reliably
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        // Check if navigator.permissions is available
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permission.state === 'granted') {
            setMicPermission('granted');
          } else if (permission.state === 'denied') {
            setMicPermission('denied');
          } else {
            setMicPermission('pending');
          }
        } else {
          // Fallback: assume permission is needed
          setMicPermission('pending');
        }
      } catch (error) {
        console.log('Permission check failed, assuming pending:', error);
        setMicPermission('pending');
      }
    };

    checkMicPermission();
  }, []);

  const startVoiceInterview = async () => {
    try {
      // Always request mic permission explicitly before starting
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If we get here, permission was granted
      setMicPermission('granted');
      
      // Clean up the test stream
      stream.getTracks().forEach(track => track.stop());

      // Start the conversation - you'll need to provide your agent ID
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'your-agent-id',
        connectionType: 'webrtc',
        userId: user?.id || 'anonymous'
      });
      
      setHasStarted(true);
    } catch (error) {
      console.error('Failed to start voice interview:', error);
      setMicPermission('denied');
    }
  };

  const endVoiceInterview = async () => {
    await conversation.endSession();
    setHasStarted(false);
  };

  if (micPermission === 'denied') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MicrophoneIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Microphone Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Voice interviews require microphone access to conduct the conversation. 
            Please enable microphone permissions and try again.
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back to Mode Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Voice Interview</h1>
        <p className="text-muted-foreground">
          Weekly reflection through natural voice conversation
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
        <Card className="w-full p-8 border-black/10">
          <div className="text-center space-y-6">
            {!hasStarted ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MicrophoneIcon className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Ready to Start</h2>
                  <p className="text-muted-foreground">
                    Click below to begin your voice interview. The AI will guide you through 
                    reflecting on your week and identifying key insights.
                  </p>
                </div>
                <Button 
                  onClick={startVoiceInterview}
                  className="px-8 py-3 text-base"
                  size="lg"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Voice Interview
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  {conversation.isSpeaking ? (
                    <SpeakerWaveIcon className="w-10 h-10 text-green-600" />
                  ) : (
                    <MicrophoneIcon className="w-10 h-10 text-green-600" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Interview in Progress</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className={conversation.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {conversation.status === 'connected' ? 'Connected' : 'Connecting...'}
                    </Badge>
                    <Badge variant="secondary">
                      {conversation.isSpeaking ? 'AI Speaking' : 'Listening'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {conversation.isSpeaking 
                      ? "AI is speaking. Listen and respond naturally."
                      : "Speak naturally about your week. The AI is listening."
                    }
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={endVoiceInterview}
                    variant="destructive"
                    className="px-8"
                  >
                    <StopIcon className="w-5 h-5 mr-2" />
                    End Interview
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    The interview will automatically end after completion
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
        
        <div className="mt-6">
          <Button variant="outline" onClick={onBack}>
            Back to Mode Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
