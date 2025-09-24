"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";

export default function InterviewModePage() {
  const router = useRouter();

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
          onClick={() => router.push('/interview/chat')}
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
          onClick={() => router.push('/interview/voice')}
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
          onClick={() => router.push('/interview/video')}
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