// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { config } from "@/lib/config";
import { limiter, APIError, errorHandler } from "@/lib/api-middleware";
import { headers } from "next/headers";
import { companyContext } from "@/lib/company-data";

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

async function createChatCompletion(messages: any[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are LibelNet's AI assistant. Use this context for accurate responses:

${companyContext}

Instructions:
- Always provide accurate information based on the above context
- Be professional and concise
- If information isn't in the context, acknowledge that you don't have that specific information
- Always use the correct location details from the context
- Maintain a helpful and professional tone`,
      },
      ...messages,
    ],
    max_tokens: config.openai.maxTokens,
    temperature: 0.7,
    stream: true,
  });

  return response;
}

export async function POST(req: Request) {
  try {
    // Get headers asynchronously
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor || "unknown";

    // Check rate limit
    const remainingTokens = limiter.tryRemoveTokens(1);
    if (remainingTokens < 0) {
      throw new APIError(429, "Rate limit exceeded. Please try again later.");
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new APIError(400, "Invalid input format");
    }

    const response = await createChatCompletion(messages);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    const { statusCode, message } = errorHandler(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
