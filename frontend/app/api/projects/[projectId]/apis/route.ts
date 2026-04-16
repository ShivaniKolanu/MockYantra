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
  recordCount: z.number().int().min(1).max(500).optional(),
});

function buildValueForType(fieldName: string, schema: unknown, rowIndex: number): unknown {
  const lower = fieldName.toLowerCase();
  const type =
    schema && typeof schema === "object" && "type" in (schema as Record<string, unknown>)
      ? (schema as Record<string, unknown>).type
      : "string";

  if (type === "number" || type === "integer") {
    return rowIndex + 1;
  }

  if (type === "boolean") {
    return rowIndex % 2 === 0;
  }

  if (lower.includes("email")) {
    return `user${rowIndex + 1}@mockyantra.dev`;
  }

  if (lower.includes("id")) {
    return rowIndex + 1;
  }

  if (lower.includes("date") || lower.includes("created")) {
    return `2026-04-${String((rowIndex % 28) + 1).padStart(2, "0")}`;
  }

  return `${fieldName}-${rowIndex + 1}`;
}

function buildSampleDataFromSchema(
  schema: Record<string, unknown>,
  count: number
): Array<Record<string, unknown>> {
  const propertiesRaw = schema.properties;
  const properties =
    propertiesRaw && typeof propertiesRaw === "object"
      ? (propertiesRaw as Record<string, unknown>)
      : {};
  const fields = Object.keys(properties);

  if (fields.length === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, rowIndex) => {
    const row: Record<string, unknown> = {};

    for (const field of fields) {
      row[field] = buildValueForType(field, properties[field], rowIndex);
    }

    return row;
  });
}

function toApiBaseUrl(): string {
  return "https://api.mockyantra.dev";
}

function normalizeProjectCode(rawProjectCode: string): string {
  return rawProjectCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
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
      select: { id: true, name: true, baseUrl: true },
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

      name = input.name?.trim() || generated.name;
      method = input.method ?? generated.method;
      endpointPath = input.endpointPath?.trim() || generated.endpointPath;
      const descriptionCandidate = input.description?.trim() || generated.description;
      description = descriptionCandidate || "";
      responseSchema = generated.responseSchema;
      sampleData = generated.sampleData;
    } else {
      const requestedCount = input.recordCount ?? 10;
      sampleData = buildSampleDataFromSchema(responseSchema, requestedCount);
    }

    if (!name || !endpointPath) {
      return NextResponse.json(
        { error: "name and endpointPath are required" },
        { status: 400 }
      );
    }

    const projectCodeRows = await prisma.$queryRaw<Array<{ projectCode: string | null }>>`
      SELECT projectCode
      FROM Project
      WHERE id = ${projectId}
      LIMIT 1
    `;

    const projectCodeFromDb = projectCodeRows[0]?.projectCode ?? null;

    const normalizedPath = normalizePath(endpointPath);
    const pathWithoutLeadingSlash = normalizedPath.replace(/^\/+/, "");
    const fallbackFromName = normalizeProjectCode(project.name);
    const projectCodeFromLookup = normalizeProjectCode(projectCodeFromDb || "");
    const projectCode = projectCodeFromLookup || fallbackFromName || project.id;
    const routedEndpointPath = normalizePath(`/${projectCode}/${pathWithoutLeadingSlash}`);
    const baseUrl = toApiBaseUrl();
    const fullEndpoint = `${baseUrl}${routedEndpointPath}`;
    const responsePayload = {
      schema: responseSchema,
      sampleData,
      endpointPath: routedEndpointPath,
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
