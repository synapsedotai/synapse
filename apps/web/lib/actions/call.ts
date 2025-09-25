'use server';

import { getCloudflareContext } from "@opennextjs/cloudflare";

interface OutboundCallResponse {
  success: boolean;
  message: string;
  conversation_id: string;
  callSid: string;
}

interface CallUserParams {
  phoneNumber: string;
  agentId: string;
  agentPhoneNumberId: string;
}

export async function callUser({ 
  phoneNumber, 
  agentId, 
  agentPhoneNumberId 
}: CallUserParams): Promise<{ success: boolean; message: string; data?: OutboundCallResponse }> {
  let apiKey: string | undefined;
  
  try {
    // Try to get from Cloudflare context first
    const { env } = await getCloudflareContext();
    apiKey = env.ELEVENLABS_API_KEY as string;
  } catch {
    // Fallback to process.env for local development
    apiKey = process.env.ELEVENLABS_API_KEY;
  }
  
  if (!apiKey) {
    return {
      success: false,
      message: 'ElevenLabs API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: agentPhoneNumberId,
        to_number: phoneNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return {
        success: false,
        message: `Failed to initiate call: ${response.status} ${response.statusText}`
      };
    }

    const data: OutboundCallResponse = await response.json();
    
    return {
      success: true,
      message: 'Call initiated successfully',
      data
    };
  } catch (error) {
    console.error('Error calling user:', error);
    return {
      success: false,
      message: 'Failed to initiate call. Please try again.'
    };
  }
}

// Schedule weekly calls (placeholder - would need proper scheduling system)
export async function scheduleWeeklyCall({
  phoneNumber,
  preferredTime,
  timezone = 'UTC'
}: {
  phoneNumber: string;
  preferredTime: string; // Format: "HH:mm" 
  timezone?: string;
}): Promise<{ success: boolean; message: string }> {
  // This is a placeholder implementation
  // In a real app, you'd integrate with a job scheduler like:
  // - Vercel Cron Jobs
  // - AWS EventBridge
  // - Node-cron with a database
  // - Bull Queue with Redis
  
  try {
    // For now, just log the scheduling request
    console.log('Scheduling weekly call:', {
      phoneNumber,
      preferredTime,
      timezone,
      scheduledAt: new Date().toISOString()
    });
    
    // TODO: Implement actual scheduling logic
    // This could involve:
    // 1. Storing the schedule in a database
    // 2. Setting up a cron job or scheduled function
    // 3. Implementing retry logic for declined calls
    
    return {
      success: true,
      message: `Scheduled - you can update timing here anytime`
    };
  } catch (error) {
    console.error('Error scheduling weekly call:', error);
    return {
      success: false,
      message: 'Failed to schedule weekly calls. Please try again.'
    };
  }
}
