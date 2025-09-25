import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = 'edge';

export async function GET() {
  try {
    // Get the Cloudflare context to access environment variables
    const { env } = await getCloudflareContext();
    
    // Get the ElevenLabs agent ID from Cloudflare environment
    const elevenlabsAgentId = env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || env.ELEVENLABS_AGENT_ID;
    
    // Return public configuration
    // Note: Only return non-sensitive configuration values
    return new Response(
      JSON.stringify({
        elevenlabsAgentId: elevenlabsAgentId || '',
        // Add other public config values here as needed
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error('Config API error:', error);
    
    // Fallback to process.env for local development
    return new Response(
      JSON.stringify({
        elevenlabsAgentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }
}
