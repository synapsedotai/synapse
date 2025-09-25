"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function VideoInterviewPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const iframe = document.createElement('iframe');
    
    iframe.src = 'https://bey.chat/cb50f891-2a25-4d51-b4f9-750e7ac39d08';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.allow = 'camera; microphone; fullscreen';
    iframe.allowFullscreen = true;
    
    container.appendChild(iframe);
    
    const handleResize = () => {
      const containerWidth = container.clientWidth;
      // Additional resize logic if needed
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(iframe)) {
        container.removeChild(iframe);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/interview')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Video Interview</h1>
          <p className="text-muted-foreground">
            Face-to-face conversation with your AI interviewer
          </p>
        </div>
      </div>

      {/* Video Call Container */}
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full h-full min-h-[600px]"
          style={{ minHeight: '600px' }}
        />
      </div>
    </div>
  );
}
