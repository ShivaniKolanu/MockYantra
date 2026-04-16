import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateApiFromPrompt } from "@/lib/server/services/gemini";

const RequestSchema = z.object({
  prompt: z.string().min(1),
  fields: z.string().optional(),
  recordCount: z.number().int().min(1).max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.parse(body);

    const generated = await generateApiFromPrompt(parsed);
    return NextResponse.json(generated);
  } catch (error) {
    console.error("Error generating API from prompt:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate API from prompt" },
      { status: 500 }
    );
  }
}
