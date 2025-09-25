import { streamText, tool, stepCountIs } from "ai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function POST(request: Request) {
  try {
    // Get the Cloudflare context to access environment variables
    const { env } = await getCloudflareContext();
    
    // Get API key from Cloudflare environment
    const apiKey = env.OPENROUTER_API_KEY || env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openrouter = createOpenRouter({
      apiKey: apiKey as string,
    });

    const body = await request.json();
    const { messages, mode, systemPrompt, tools: clientTools } = body;

    // Define tools based on mode
    let tools = {};
    
    if (mode === 'interview' && clientTools) {
      if (clientTools.memorizeUserInfo) {
        tools = {
          ...tools,
          memorizeUserInfo: tool({
            description: "Store important personal or hobby information about Joe",
            parameters: z.object({
              info: z.string().describe("The specific personal detail to remember"),
            }),
            execute: async ({ info }) => {
              // This will be handled client-side
              return { stored: true, info };
            },
          }),
        };
      }
      
      if (clientTools.endInterview) {
        tools = {
          ...tools,
          endInterview: tool({
            description: "End the interview with a summary and recommendations",
            parameters: z.object({
              summary: z.string().describe("Summary of the week's accomplishments and insights"),
              recommendations: z.array(z.string()).describe("3 specific action items for next week"),
            }),
            execute: async ({ summary, recommendations }) => {
              // This will be handled client-side
              return { ended: true, summary, recommendations: recommendations ?? [] };
            },
          }),
        };
      }
    }
    
    if (mode === 'connect' && clientTools) {
      if (clientTools.searchEmployee) {
        tools = {
          ...tools,
          searchEmployee: tool({
            description: "Search for employees by expertise or skill",
            parameters: z.object({
              query: z.string().describe("The expertise or skill to search for"),
            }),
            execute: async ({ query }) => {
              // This will be handled client-side
              return { search: true, query };
            },
          }),
        };
      }
      
      if (clientTools.proposeEmployee) {
        tools = {
          ...tools,
          proposeEmployee: tool({
            description: "Propose a specific employee for connection",
            parameters: z.object({
              employeeId: z.string().describe("The ID of the employee to propose"),
              reason: z.string().describe("Why this person is a good match"),
            }),
            execute: async ({ employeeId, reason }) => {
              // This will be handled client-side
              return { proposed: true, employeeId, reason };
            },
          }),
        };
      }
    }

    // Stream the response
    const result = streamText({
      model: openrouter("openai/gpt-4o-2024-11-20"),
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      system: systemPrompt,
      temperature: 0.7,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      stopWhen: stepCountIs(6),
    });

    // Return the stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
