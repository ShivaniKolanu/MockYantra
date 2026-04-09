import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiFromPrompt } from "@/lib/server/services/gemini";
import { Prisma } from "@/app/generated/prisma/client";

const RequestSchema = z.object({
  mode: z.enum(["ai", "manual"]).default("ai"),
  name: z.string().min(1).optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  endpointPath: z.string().min(1).optional(),
  description: z.string().optional(),
  responseSchema: z.record(z.string(), z.unknown()).optional(),
  aiPrompt: z.string().min(1).optional(),
  aiFields: z.string().optional(),
  recordCount: z.number().int().min(1).max(100).optional(),
});

function toApiBaseUrl(rawBaseUrl?: string | null): string {
  const fallback = "https://api.mockyantra.dev";

  if (!rawBaseUrl || rawBaseUrl.trim().length === 0) {
    return fallback;
  }

  return rawBaseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+/g, "/");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const input = RequestSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, baseUrl: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let name = input.name?.trim() ?? "";
    let method = input.method ?? "GET";
    let endpointPath = input.endpointPath?.trim() ?? "";
    let description = input.description?.trim() ?? "";
    let responseSchema: Record<string, unknown> = input.responseSchema ?? {};
    let sampleData: unknown[] = [];

    if (input.mode === "ai") {
      if (!input.aiPrompt) {
        return NextResponse.json(
          { error: "aiPrompt is required when mode is ai" },
          { status: 400 }
        );
      }

      const generated = await generateApiFromPrompt({
        prompt: input.aiPrompt,
        fields: input.aiFields,
        recordCount: input.recordCount,
      });

      name = generated.name;
      method = generated.method;
      endpointPath = generated.endpointPath;
      description = generated.description ?? "";
      responseSchema = generated.responseSchema;
      sampleData = generated.sampleData;
    }

    if (!name || !endpointPath) {
      return NextResponse.json(
        { error: "name and endpointPath are required" },
        { status: 400 }
      );
    }

    const normalizedPath = normalizePath(endpointPath);
    const baseUrl = toApiBaseUrl(project.baseUrl);
    const fullEndpoint = `${baseUrl}${normalizedPath}`;
    const responsePayload = {
      schema: responseSchema,
      sampleData,
      endpointPath: normalizedPath,
    } as Prisma.InputJsonValue;

    const duplicate = await prisma.api.findFirst({
      where: {
        projectId,
        method,
        endpoint: fullEndpoint,
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "An API with the same method and endpoint already exists in this project" },
        { status: 409 }
      );
    }

    const created = await prisma.api.create({
      data: {
        projectId,
        name,
        method,
        endpoint: fullEndpoint,
        description: description || null,
        responseSchema: responsePayload,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create API" }, { status: 500 });
  }
}
