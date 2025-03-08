// lib/api-middleware.ts
import { RateLimiter } from "limiter";

// Create a rate limiter that allows 10 requests per minute
export const limiter = new RateLimiter({
  tokensPerInterval: 10000,
  interval: "minute",
  fireImmediately: true,
});

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function errorHandler(error: unknown) {
  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  console.error("Unhandled error:", error);
  return {
    statusCode: 500,
    message: "Internal server error",
  };
}
