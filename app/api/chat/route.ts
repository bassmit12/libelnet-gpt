// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { config } from "@/lib/config";
import { limiter, APIError, errorHandler } from "@/lib/api-middleware";
import { companyContext } from "@/lib/company-data";
import { ChatMessage } from "@/types/chat";

// Initialize OpenAI client
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: config.openai.apiKey,
    organization: config.openai.orgId,
  });
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  throw new Error("OpenAI client initialization failed");
}

async function createChatCompletion(messages: ChatMessage[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new APIError(500, "Failed to generate response from OpenAI");
  }
}

export async function POST(req: Request) {
  try {
    // Validate OpenAI API key
    if (!config.openai.apiKey) {
      throw new APIError(500, "OpenAI API key is not configured");
    }

    // Validate request method
    if (req.method !== "POST") {
      throw new APIError(405, "Method not allowed");
    }

    // Check rate limit
    const hasTokens = await limiter.removeTokens(1);
    if (!hasTokens) {
      throw new APIError(429, "Rate limit exceeded. Please try again later.");
    }

    // Parse and validate request body
    let messages: ChatMessage[];
    try {
      const body = await req.json();
      if (!body.messages || !Array.isArray(body.messages)) {
        throw new APIError(
          400,
          "Invalid request body: messages array is required",
        );
      }
      messages = body.messages;

      // Validate message format
      for (const message of messages) {
        if (
          !message.role ||
          !message.content ||
          typeof message.content !== "string"
        ) {
          throw new APIError(400, "Invalid message format");
        }
        if (!["user", "assistant", "system"].includes(message.role)) {
          throw new APIError(400, "Invalid message role");
        }
      }
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(400, "Invalid JSON payload");
    }

    // Generate response
    const response = await createChatCompletion(messages);

    // Set up streaming response
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
        }
      },
    });

    // Return streaming response
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

    // Log additional error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Detailed error:", {
        error,
        statusCode,
        message,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
