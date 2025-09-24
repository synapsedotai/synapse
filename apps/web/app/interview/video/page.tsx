"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoCameraIcon } from "@heroicons/react/24/solid";

export default function VideoInterviewPage() {
  const router = useRouter();

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
        <Button variant="outline" onClick={() => router.push('/interview')}>
          Back to Mode Selection
        </Button>
      </div>
    </div>
  );
}
