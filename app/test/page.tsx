// app/test/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TestResult {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  details?: Record<string, unknown>;
}

interface APIResponse {
  status: string;
  message: string;
  config?: {
    apiKeyConfigured: boolean;
    orgIdConfigured: boolean;
    environment: string;
  };
  response?: {
    id: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: string;
  details?: Record<string, unknown>;
}

export default function TestPage() {
  const [result, setResult] = useState<TestResult>({
    status: "idle",
  });

  const testConnection = async () => {
    setResult({ status: "loading" });
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Test connection",
        }),
      });

      const data = (await response.json()) as APIResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setResult({
        status: "success",
        message: "Connection successful!",
        details: data,
      });
    } catch (error) {
      console.error("Test failed:", error);
      setResult({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : { error },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            OpenAI API Connection Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test the connection to OpenAI API and view detailed debug
            information
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={testConnection}
                  disabled={result.status === "loading"}
                  className="w-full sm:w-auto"
                >
                  {result.status === "loading"
                    ? "Testing..."
                    : "Test Connection"}
                </Button>
              </div>

              {/* Environment Variables */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2 dark:text-white">
                  Environment Variables Check
                </h2>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
                    {JSON.stringify(
                      {
                        NODE_ENV: process.env.NODE_ENV,
                        OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
                        OPENAI_ORG_ID_SET: !!process.env.OPENAI_ORG_ID,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>

              {/* Test Results */}
              {result.status !== "idle" && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">
                    Test Results
                  </h2>
                  <div
                    className={`p-4 rounded-md ${
                      result.status === "success"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : result.status === "error"
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`text-sm ${
                        result.status === "success"
                          ? "text-green-700 dark:text-green-400"
                          : result.status === "error"
                            ? "text-red-700 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="font-semibold">
                        Status: {result.status.toUpperCase()}
                      </div>
                      {result.message && (
                        <div className="mt-2">Message: {result.message}</div>
                      )}
                      {result.details && (
                        <div className="mt-2">
                          <div className="font-semibold">Details:</div>
                          <pre className="mt-1 overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Information */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">
              Debug Information
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong>Browser:</strong>{" "}
                {typeof window !== "undefined"
                  ? window.navigator.userAgent
                  : "N/A"}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </div>
              <div>
                <strong>Next.js Runtime:</strong>{" "}
                {typeof window === "undefined" ? "Server" : "Client"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
