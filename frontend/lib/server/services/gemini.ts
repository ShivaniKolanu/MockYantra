import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ApiFromPromptSchema = z.object({
  name: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  endpointPath: z.string().min(1),
  description: z.string().optional().default(""),
  responseSchema: z.record(z.string(), z.unknown()),
  sampleData: z.array(z.record(z.string(), z.unknown())).min(1),
});

export type GeneratedApiSpec = z.infer<typeof ApiFromPromptSchema>;

const SYSTEM_INSTRUCTIONS = `You are an API design assistant.
Return JSON only.
No markdown.
No code fences.
No commentary.
Generate realistic, production-style API metadata.
endpointPath must start with '/'.
method must be one of: GET, POST, PUT, PATCH, DELETE.`;

function extractJson(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();
  }

  return trimmed;
}

type GenerationSeed = {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpointPath: string;
  description: string;
  responseSchema: Record<string, unknown>;
};

function isRecoverableGenerationError(error: unknown): boolean {
  return error instanceof SyntaxError || error instanceof z.ZodError;
}

async function requestGeneratedSpec(params: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
  fields?: string;
  recordCount: number;
  seed?: GenerationSeed;
}): Promise<GeneratedApiSpec> {
  const { ai, model, prompt, fields, recordCount, seed } = params;

  const userPrompt = [
    `User request: ${prompt}`,
    fields ? `Preferred fields: ${fields}` : "",
    `Generate exactly ${recordCount} sample records.`,
    seed
      ? [
          "Use this fixed API metadata and schema exactly as-is:",
          JSON.stringify(
            {
              name: seed.name,
              method: seed.method,
              endpointPath: seed.endpointPath,
              description: seed.description,
              responseSchema: seed.responseSchema,
            },
            null,
            2
          ),
          "Do not change metadata or schema. Only generate new sampleData rows.",
        ].join("\n")
      : "",
    "Return this exact JSON shape:",
    JSON.stringify(
      {
        name: "Users API",
        method: "GET",
        endpointPath: "/users",
        description: "Returns users list",
        responseSchema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
        sampleData: [{ id: 1, name: "Alice" }],
      },
      null,
      2
    ),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTIONS,
      temperature: seed ? 0.2 : 0.3,
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  let validated: GeneratedApiSpec;

  try {
    const parsed = JSON.parse(extractJson(rawText));
    validated = ApiFromPromptSchema.parse(parsed);
  } catch (error) {
    if (isRecoverableGenerationError(error)) {
      throw error;
    }

    throw new Error("Gemini returned an invalid JSON payload");
  }

  if (!validated.endpointPath.startsWith("/")) {
    validated.endpointPath = `/${validated.endpointPath}`;
  }

  return validated;
}

async function requestGeneratedSpecWithRetry(params: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
  fields?: string;
  recordCount: number;
  seed?: GenerationSeed;
}): Promise<GeneratedApiSpec> {
  const batchSizes = Array.from(
    new Set([
      params.recordCount,
      Math.max(1, Math.ceil(params.recordCount / 2)),
      Math.max(1, Math.ceil(params.recordCount / 4)),
      25,
      10,
    ])
  ).filter((size) => size <= params.recordCount);

  let lastError: unknown;

  for (const batchSize of batchSizes) {
    try {
      return await requestGeneratedSpec({
        ...params,
        recordCount: batchSize,
      });
    } catch (error) {
      lastError = error;

      if (!isRecoverableGenerationError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate valid JSON from Gemini after retries");
}

export async function generateApiFromPrompt(input: {
  prompt: string;
  fields?: string;
  recordCount?: number;
}): Promise<GeneratedApiSpec> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const targetCount = Math.max(1, Math.min(input.recordCount ?? 5, 500));
  const batchSize = 100;

  const firstBatchSize = Math.min(batchSize, targetCount);
  const first = await requestGeneratedSpecWithRetry({
    ai,
    model,
    prompt: input.prompt,
    fields: input.fields,
    recordCount: firstBatchSize,
  });

  if (targetCount <= first.sampleData.length) {
    first.sampleData = first.sampleData.slice(0, targetCount);
    return first;
  }

  const merged: GeneratedApiSpec = {
    ...first,
    sampleData: [...first.sampleData],
  };

  const seed: GenerationSeed = {
    name: first.name,
    method: first.method,
    endpointPath: first.endpointPath,
    description: first.description,
    responseSchema: first.responseSchema,
  };

  while (merged.sampleData.length < targetCount) {
    const remaining = targetCount - merged.sampleData.length;
    const currentBatchSize = Math.min(batchSize, remaining);

    const nextBatch = await requestGeneratedSpecWithRetry({
      ai,
      model,
      prompt: input.prompt,
      fields: input.fields,
      recordCount: currentBatchSize,
      seed,
    });

    merged.sampleData.push(...nextBatch.sampleData.slice(0, currentBatchSize));
  }

  merged.sampleData = merged.sampleData.slice(0, targetCount);
  return merged;
}
