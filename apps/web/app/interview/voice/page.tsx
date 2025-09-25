"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { callUser, scheduleWeeklyCall } from "@/lib/actions/call";
import { VoiceInterview } from "@/components/voice-interview";
import { useAtom } from "jotai";
import { userDataAtom } from "@/lib/atoms";
import {
  PhoneIcon,
  ClockIcon,
  CalendarDaysIcon,
  ComputerDesktopIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

// Constants for the agent configuration
console.log(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID);

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';
const AGENT_PHONE_NUMBER_ID = 'phnum_0601k600gn01eyz9e9w49g2fzq97';
const TEST_PHONE_NUMBER = '+491794910770';

export default function VoiceInterviewPage() {
  const router = useRouter();
  const [user] = useAtom(userDataAtom);
  const [selectedMode, setSelectedMode] = useState<'selection' | 'web' | 'phone'>('selection');
  
  // State for immediate call
  const [isCallingNow, setIsCallingNow] = useState(false);
  const [callMessage, setCallMessage] = useState<string | null>(null);
  
  // State for weekly scheduling
  const [phoneNumber, setPhoneNumber] = useState('+491794910770');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  const handleCallNow = async () => {
    if (!AGENT_ID) {
      setCallMessage('Agent not configured. Please contact support.');
      return;
    }

    setIsCallingNow(true);
    setCallMessage(null);

    try {
      const result = await callUser({
        phoneNumber: TEST_PHONE_NUMBER,
        agentId: AGENT_ID,
        agentPhoneNumberId: AGENT_PHONE_NUMBER_ID,
      });

      if (result.success) {
        setCallMessage(`Call initiated! Check your phone at ${TEST_PHONE_NUMBER}`);
      } else {
        setCallMessage(`Failed to initiate call: ${result.message}`);
      }
    } catch (error) {
      setCallMessage('Failed to initiate call. Please try again.');
    } finally {
      setIsCallingNow(false);
    }
  };

  const handleScheduleWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setScheduleMessage('Please enter a phone number');
      return;
    }

    setIsScheduling(true);
    setScheduleMessage(null);

    try {
      const result = await scheduleWeeklyCall({
        phoneNumber: phoneNumber.trim(),
        preferredTime,
      });

      if (result.success) {
        setScheduleMessage(result.message);
        // Clear form on success
        setPhoneNumber('');
      } else {
        setScheduleMessage(`Failed to schedule: ${result.message}`);
      }
    } catch (error) {
      setScheduleMessage('Failed to schedule weekly calls. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const goBack = () => {
    if (selectedMode === 'web') {
      setSelectedMode('selection');
    } else {
      router.push('/interview');
    }
  };

  // Show web voice interview if selected
  if (selectedMode === 'web') {
    return <VoiceInterview onBack={goBack} />;
  }

  // Show voice method selection
  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Voice Interview Options</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to conduct your voice interview
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full space-y-6">
        
        {/* Option 1: Web-based Voice */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Web Voice Interview</h2>
              <p className="text-muted-foreground mb-4">
                Start your voice interview directly in your browser. Requires microphone access.
              </p>
              <Button onClick={() => setSelectedMode('web')} size="lg">
                Start Web Interview
              </Button>
            </div>
          </div>
        </Card>

        <Separator />

        {/* Option 2: Immediate Phone Call */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <PhoneIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Call Me Now</h2>
              <p className="text-muted-foreground mb-4">
                Get an immediate phone call from our AI assistant for your weekly reflection.
              </p>
              {callMessage && (
                <div className={`p-3 rounded-lg mb-4 ${
                  callMessage.includes('initiated') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {callMessage}
                </div>
              )}
              <Button 
                onClick={handleCallNow} 
                disabled={isCallingNow || !AGENT_ID}
                size="lg"
              >
                {isCallingNow ? 'Calling...' : `Call ${TEST_PHONE_NUMBER}`}
              </Button>
            </div>
          </div>
        </Card>

        <Separator />

        {/* Option 3: Schedule Weekly Calls */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Schedule Weekly Calls</h2>
              <p className="text-muted-foreground mb-4">
                Set up automatic weekly phone calls at your preferred time. 
                The system will retry with additional delays if calls are declined.
              </p>
              
              <form onSubmit={handleScheduleWeekly} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={!isEditingPhone}
                        className={!isEditingPhone ? 'bg-gray-50' : ''}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPhone(!isEditingPhone)}
                        className="px-3"
                      >
                        {isEditingPhone ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <PencilIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time</Label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Weekly calls scheduled at your preferred time</li>
                    <li>• If you miss a call, we'll retry 30 minutes later</li>
                    <li>• If still missed, we'll try again 2 hours later</li>
                    <li>• You can always reschedule or cancel anytime</li>
                  </ul>
                </div>

                {scheduleMessage && (
                  <div className={`p-3 rounded-lg ${
                    scheduleMessage.includes('scheduled') 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {scheduleMessage}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isScheduling}
                  size="lg"
                >
                  {isScheduling ? 'Scheduling...' : 'Schedule Weekly Calls'}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={goBack}>
            Back to Interview Options
          </Button>
        </div>
      </div>
    </div>
  );
}