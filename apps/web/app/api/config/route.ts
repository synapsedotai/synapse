import { NextRequest, NextResponse } from 'next/server';

interface CloudflareEnv {
  ELEVENLABS_AGENT_ID?: string;
  ELEVENLABS_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Access Cloudflare environment variables
    // In Cloudflare Workers, env variables are available through the context
    const env = process.env as CloudflareEnv;
    
    // For Cloudflare Workers deployment, we need to access env through the context
    // This will work both locally and in production
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'ElevenLabs agent ID not configured' },
        { status: 500 }
      );
    }

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      elevenlabs: {
        agentId: agentId
      },
      openrouter: {
        apiKey: openrouterApiKey
      }
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}