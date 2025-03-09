// app/api/test/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { config } from "@/lib/config";

export async function POST() {
  try {
    // Detailed environment check
    const envCheck = {
      hasApiKey: !!config.openai.apiKey,
      apiKeyLength: config.openai.apiKey?.length || 0,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
    };

    // Check if API key is configured
    if (!config.openai.apiKey) {
      return NextResponse.json(
        {
          status: "error",
          error: "OpenAI API key is not configured",
          envCheck,
        },
        { status: 500 },
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.orgId,
    });

    try {
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
          vercelEnvironment: envCheck,
        },
        response: {
          id: response.id,
          model: response.model,
          usage: response.usage,
        },
      });
    } catch (openaiError) {
      console.error("OpenAI API call failed:", openaiError);
      return NextResponse.json(
        {
          status: "error",
          error: "OpenAI API call failed",
          details: {
            message:
              openaiError instanceof Error
                ? openaiError.message
                : "Unknown OpenAI error",
            type: openaiError instanceof Error ? openaiError.name : "Unknown",
            stack:
              process.env.NODE_ENV === "development"
                ? openaiError instanceof Error
                  ? openaiError.stack
                  : undefined
                : undefined,
          },
          envCheck,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Server error occurred",
        details: {
          message:
            error instanceof Error ? error.message : "Unknown server error",
          type: error instanceof Error ? error.name : "Unknown",
          stack:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.stack
                : undefined
              : undefined,
        },
        envCheck: {
          hasApiKey: !!config.openai.apiKey,
          apiKeyLength: config.openai.apiKey?.length || 0,
          environment: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          isVercel: !!process.env.VERCEL,
        },
      },
      { status: 500 },
    );
  }
}
