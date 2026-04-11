import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PROJECT_CODE_REGEX = /^[a-z0-9-]+$/;

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        apis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, projectCode, description, baseUrl } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const normalizedProjectCode = String(projectCode ?? "").trim().toLowerCase();

    if (!normalizedProjectCode) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!PROJECT_CODE_REGEX.test(normalizedProjectCode)) {
      return NextResponse.json(
        { error: "Project ID can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findFirst({
      where: { projectCode: normalizedProjectCode },
      select: { id: true },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project ID already exists" },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        projectCode: normalizedProjectCode,
        description: description?.trim() || null,
        baseUrl: baseUrl?.trim() || null,
      },
      include: {
        apis: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
