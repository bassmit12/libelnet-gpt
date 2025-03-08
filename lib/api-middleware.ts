// lib/api-middleware.ts
import { RateLimiter } from "limiter";

// Create a rate limiter that allows 100 requests per 15 minutes
export const limiter = new RateLimiter({
  tokensPerInterval: 100000,
  interval: 900000, // 15 minutes in milliseconds
});

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export const errorHandler = (error: any) => {
  if (error instanceof APIError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  console.error("Unexpected error:", error);
  return { statusCode: 500, message: "Internal server error" };
};
