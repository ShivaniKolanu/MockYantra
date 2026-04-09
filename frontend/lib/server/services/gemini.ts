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
  const recordCount = Math.max(1, Math.min(input.recordCount ?? 5, 50));

  const userPrompt = [
    `User request: ${input.prompt}`,
    input.fields ? `Preferred fields: ${input.fields}` : "",
    `Generate ${recordCount} sample records.`,
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
      temperature: 0.3,
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(extractJson(rawText));
  const validated = ApiFromPromptSchema.parse(parsed);

  if (!validated.endpointPath.startsWith("/")) {
    validated.endpointPath = `/${validated.endpointPath}`;
  }

  return validated;
}
