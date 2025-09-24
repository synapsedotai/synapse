"use client";

import { VoiceInterview } from "@/components/voice-interview";
import { useRouter } from "next/navigation";

export default function VoiceInterviewPage() {
  const router = useRouter();

  return (
    <VoiceInterview onBack={() => router.push('/interview')} />
  );
}
