"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useConversation } from '@elevenlabs/react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string>('');
  const searchParams = useSearchParams();

  // Fetch agent ID from server or URL params
  useEffect(() => {
    const urlAgentId = searchParams?.get('agent_id');
    if (urlAgentId) {
      setAgentId(urlAgentId);
    } else {
      fetch('/api/config')
        .then(res => res.json())
        .then(data => {
          if (data.elevenlabsAgentId) {
            setAgentId(data.elevenlabsAgentId);
          }
        })
        .catch(err => console.error('Failed to fetch config:', err));
    }
  }, [searchParams]);

  // Minimal conversation setup - exactly as per docs
  const conversation = useConversation();

  const startVoiceInterview = async () => {
    if (!agentId) {
      setErrorMessage('Voice interview is currently unavailable. Please try again later.');
      return;
    }

    setErrorMessage(null);

    try {
      // Request microphone permission first - as per docs
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation - minimal as per docs
      await conversation.startSession({
        agentId,
        connectionType: 'webrtc'
      });
    } catch (error: any) {
      console.error('Error starting voice interview:', error);
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Microphone access denied. Please allow microphone access and try again.');
      } else {
        setErrorMessage('Failed to start voice interview. Please check your microphone and try again.');
      }
    }
  };

  const endVoiceInterview = async () => {
    await conversation.endSession();
  };

  const isConnected = conversation.status === 'connected';

  if (errorMessage) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MicrophoneIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <div className="space-y-2">
            <Button onClick={() => setErrorMessage(null)}>Try Again</Button>
            <Button variant="outline" onClick={onBack}>Back to Mode Selection</Button>
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
        <Card className="w-full p-8">
          <div className="text-center space-y-6">
            {!isConnected ? (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MicrophoneIcon className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Ready to Start</h2>
                  <p className="text-muted-foreground mb-4">
                    Click below to begin your voice interview. The AI will guide you through 
                    reflecting on your week and identifying key insights.
                  </p>
                </div>
                <Button 
                  onClick={startVoiceInterview}
                  disabled={!agentId}
                  className="px-8 py-3 text-base"
                  size="lg"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Voice Interview
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  {conversation.isSpeaking ? (
                    <SpeakerWaveIcon className="w-10 h-10 text-green-600 animate-pulse" />
                  ) : (
                    <MicrophoneIcon className="w-10 h-10 text-green-600" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Interview Active</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                    <Badge variant="secondary">
                      {conversation.isSpeaking ? 'AI Speaking' : 'Listening'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {conversation.isSpeaking 
                      ? "AI is speaking. Listen and respond naturally."
                      : "Speak naturally about your week. The AI is listening."
                    }
                  </p>
                </div>
                
                <Button 
                  onClick={endVoiceInterview}
                  variant="destructive"
                  className="px-8"
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  End Interview
                </Button>
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