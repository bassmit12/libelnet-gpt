// app/api/test/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { config } from "@/lib/config";

export async function POST() {
  try {
    // Check if API key is configured
    if (!config.openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.orgId,
    });

    // Try to make a simple API call
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello, this is a test message." }],
      max_tokens: 50,
    });

    // Return success response with details
    return NextResponse.json({
      status: "success",
      message: "OpenAI API connection successful",
      config: {
        apiKeyConfigured: !!config.openai.apiKey,
        orgIdConfigured: !!config.openai.orgId,
        environment: process.env.NODE_ENV,
      },
      response: {
        id: response.id,
        model: response.model,
        usage: response.usage,
      },
    });
  } catch (error) {
    console.error("OpenAI API test failed:", error);

    // Prepare error details
    const errorDetails = {
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      name: error instanceof Error ? error.name : "Unknown error type",
      stack:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined,
      config: {
        apiKeyConfigured: !!config.openai.apiKey,
        orgIdConfigured: !!config.openai.orgId,
        environment: process.env.NODE_ENV,
      },
    };

    // Return error response
    return NextResponse.json(
      {
        status: "error",
        error: errorDetails.message,
        details: errorDetails,
      },
      { status: 500 },
    );
  }
}
