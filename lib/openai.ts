// lib/openai.ts
import OpenAI from "openai";
import { config } from "./config";

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

export { openai };
