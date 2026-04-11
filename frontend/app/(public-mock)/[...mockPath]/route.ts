import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StoredResponseSchema = {
  schema?: Record<string, unknown>;
  sampleData?: unknown;
  endpointPath?: unknown;
};

function normalizePath(pathname: string): string {
  const trimmed = pathname.trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/g, "") || "/";
}

function extractEndpointPath(responseSchema: unknown): string | null {
  if (!responseSchema || typeof responseSchema !== "object") {
    return null;
  }

  const payload = responseSchema as StoredResponseSchema;

  if (typeof payload.endpointPath !== "string") {
    return null;
  }

  return normalizePath(payload.endpointPath);
}

function extractSampleData(responseSchema: unknown): unknown[] {
  if (!responseSchema || typeof responseSchema !== "object") {
    return [];
  }

  const payload = responseSchema as StoredResponseSchema;
  return Array.isArray(payload.sampleData) ? payload.sampleData : [];
}

async function handlePublicRequest(
  request: NextRequest,
  { params }: { params: Promise<{ mockPath: string[] }> }
) {
  try {
    const { mockPath } = await params;
    const requestedPath = normalizePath(`/${mockPath.join("/")}`);
    const method = request.method.toUpperCase();

    const candidates = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        responseSchema: string | object | null;
      }>
    >`
      SELECT id, name, responseSchema
      FROM Api
      WHERE method = ${method} AND isActive = 1
    `;

    const matchedApi = candidates.find((api) => {
      let parsedResponseSchema: unknown = null;

      if (typeof api.responseSchema === "string") {
        try {
          parsedResponseSchema = JSON.parse(api.responseSchema);
        } catch {
          parsedResponseSchema = null;
        }
      } else if (api.responseSchema && typeof api.responseSchema === "object") {
        parsedResponseSchema = api.responseSchema;
      }

      return extractEndpointPath(parsedResponseSchema) === requestedPath;
    });

    if (!matchedApi) {
      return NextResponse.json({ error: "Mock API not found or inactive" }, { status: 404 });
    }

    let parsedResponseSchema: unknown = null;

    if (typeof matchedApi.responseSchema === "string") {
      try {
        parsedResponseSchema = JSON.parse(matchedApi.responseSchema);
      } catch {
        parsedResponseSchema = null;
      }
    } else if (matchedApi.responseSchema && typeof matchedApi.responseSchema === "object") {
      parsedResponseSchema = matchedApi.responseSchema;
    }

    const sampleData = extractSampleData(parsedResponseSchema);

    return NextResponse.json(sampleData, {
      status: 200,
      headers: {
        "x-mockyantra-api-id": matchedApi.id,
        "x-mockyantra-api-name": matchedApi.name,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error serving public mock:", error);
    return NextResponse.json({ error: "Failed to serve mock API" }, { status: 500 });
  }
}

export const GET = handlePublicRequest;
export const POST = handlePublicRequest;
export const PUT = handlePublicRequest;
export const PATCH = handlePublicRequest;
export const DELETE = handlePublicRequest;