import OpenAI from "openai";
import { NEO_CONVERSATION_MODEL, NEO_BACKGROUND_MODEL } from "./gemini-context";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "build-placeholder-key",
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  timeout: 25000,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://app.neomind180.com",
    "X-OpenRouter-Title": "NeoMind180 Mindset Coaching",
  },
});

export interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CallOpenRouterOptions {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  responseFormatJson?: boolean;
  fallbacks?: string[];
  maxRetries?: number;
}

// Robust JSON parser that strips markdown code blocks if necessary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Attempt to extract JSON from markdown block
    const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // Fall through to throw original error
      }
    }
    throw e;
  }
}

// Implement retry logic with exponential backoff for rate limits or temporary provider failures
export async function callOpenRouterWithRetry(options: CallOpenRouterOptions): Promise<string> {
  const {
    model,
    messages,
    temperature = 0.7,
    responseFormatJson = false,
    fallbacks = [],
    maxRetries = 3,
  } = options;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }

  let delay = 1000; // start with 1s delay
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const extraBody: Record<string, unknown> = {};
      if (fallbacks.length > 0) {
        extraBody.models = fallbacks;
      }

      const response = await openrouter.chat.completions.create({
        model,
        messages,
        temperature,
        response_format: responseFormatJson ? { type: "json_object" } : undefined,
        extra_body: Object.keys(extraBody).length > 0 ? extraBody : undefined,
      } as unknown as Parameters<typeof openrouter.chat.completions.create>[0]) as OpenAI.ChatCompletion;

      const content = response.choices?.[0]?.message?.content;
      if (content === null || content === undefined) {
        throw new Error("Received an empty response from OpenRouter.");
      }

      return content;
    } catch (error: unknown) {
      const err = error as { status?: number; statusCode?: number; message?: string };
      const status = err?.status || err?.statusCode;
      // 429 for rate limit, 5xx for server errors, or fetch network issues
      const isRetryable = (status !== undefined && (status === 429 || (status >= 500 && status < 600))) || err?.message?.includes("fetch");

      console.error(
        `[OpenRouter Attempt ${attempt}/${maxRetries} Failed] model=${model}. Error:`,
        err?.message || err
      );

      if (attempt === maxRetries || !isRetryable) {
        // Log useful server-side debugging info without leaking secrets
        console.error("[OpenRouter Final Failure] Error details:", {
          status,
          message: err?.message,
          model,
          fallbacks,
        });

        // Throw safe error messages for the UI
        if (status === 429) {
          throw new Error("The coaching assistant is currently experiencing high demand. Please try again in a few moments.");
        } else {
          throw new Error("We encountered a temporary connection issue. Please try again.");
        }
      }

      // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Failed to get response after maximum retries.");
}

export async function runNeoConversation(
  messages: ChatCompletionMessageParam[],
  temperature = 0.7
): Promise<string> {
  return callOpenRouterWithRetry({
    model: NEO_CONVERSATION_MODEL,
    messages,
    temperature,
    fallbacks: [NEO_BACKGROUND_MODEL],
  });
}

export async function runNeoBackgroundTask(
  messages: ChatCompletionMessageParam[],
  responseFormatJson = true
): Promise<string> {
  return callOpenRouterWithRetry({
    model: NEO_BACKGROUND_MODEL,
    messages,
    temperature: 0.2, // structured background tasks benefit from deterministic outputs
    responseFormatJson,
  });
}
