import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ apiId: string }> }
) {
  try {
    const { apiId } = await params;

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        method: string;
        endpoint: string;
        isActive: number;
        description: string | null;
        responseSchema: string | null;
        createdAt: string;
        projectId: string;
      }>
    >`
      SELECT id, name, method, endpoint, isActive, description, responseSchema, createdAt, projectId
      FROM Api
      WHERE id = ${apiId}
      LIMIT 1
    `;

    const api = rows[0] ?? null;

    if (!api) {
      return NextResponse.json({ error: "API not found" }, { status: 404 });
    }

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

    return NextResponse.json({
      id: api.id,
      name: api.name,
      method: api.method,
      endpoint: api.endpoint,
      isActive: Boolean(api.isActive),
      description: api.description,
      responseSchema: parsedResponseSchema,
      createdAt: api.createdAt,
      projectId: api.projectId,
    });
  } catch (error) {
    console.error("Error fetching API:", error);
    return NextResponse.json({ error: "Failed to fetch API" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ apiId: string }> }
) {
  try {
    const { apiId } = await params;
    const body = (await request.json()) as { isActive?: boolean };

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const activeValue = body.isActive ? 1 : 0;

    await prisma.$executeRaw`
      UPDATE Api
      SET isActive = ${activeValue}
      WHERE id = ${apiId}
    `;

    const updatedRows = await prisma.$queryRaw<
      Array<{
        id: string;
        isActive: number;
        endpoint: string;
        method: string;
      }>
    >`
      SELECT id, isActive, endpoint, method
      FROM Api
      WHERE id = ${apiId}
      LIMIT 1
    `;

    const updated = updatedRows[0] ?? null;

    if (!updated) {
      return NextResponse.json({ error: "API not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      isActive: Boolean(updated.isActive),
      endpoint: updated.endpoint,
      method: updated.method,
    });
  } catch (error) {
    console.error("Error updating API:", error);
    return NextResponse.json({ error: "Failed to update API" }, { status: 500 });
  }
}
