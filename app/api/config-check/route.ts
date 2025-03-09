// app/api/config-check/route.ts
import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
    },
    config: {
      hasApiKey: !!config.openai.apiKey,
      apiKeyLength: config.openai.apiKey?.length || 0,
      hasOrgId: !!config.openai.orgId,
    },
    timestamp: new Date().toISOString(),
  });
}
