// lib/config.ts
interface OpenAIConfig {
  apiKey: string;
  orgId?: string;
  maxTokens: number;
  temperature: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface SecurityConfig {
  allowedOrigins: string[];
  maxRequestSize: number;
}

interface LoggingConfig {
  level: "debug" | "info" | "warn" | "error";
  enabled: boolean;
}

interface Config {
  env: string;
  openai: OpenAIConfig;
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
}

const config: Config = {
  env: process.env.NODE_ENV || "development",

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    orgId: process.env.OPENAI_ORG_ID,
    maxTokens: 2000,
    temperature: 0.7,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 1000,
  },

  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
    maxRequestSize: 1024 * 1024,
  },

  logging: {
    level:
      (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
    enabled: process.env.ENABLE_LOGGING === "true",
  },
};

// Validation
if (!config.openai.apiKey) {
  console.warn("Warning: OPENAI_API_KEY is not set");
}

// Freeze the config object to prevent modifications
Object.freeze(config);

export { config };
export type {
  Config,
  OpenAIConfig,
  RateLimitConfig,
  SecurityConfig,
  LoggingConfig,
};
