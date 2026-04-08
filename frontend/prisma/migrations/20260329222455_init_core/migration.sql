-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT NOT NULL DEFAULT 'https://api.mockyantra.dev',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ApiEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "path" TEXT NOT NULL DEFAULT '/',
    "fullUrl" TEXT NOT NULL,
    "queryParamsJson" TEXT,
    "pathParamsJson" TEXT,
    "headersJson" TEXT,
    "requestBodyJson" TEXT,
    "responseTemplateJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApiEndpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiEndpointId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "prompt" TEXT,
    "manualJson" TEXT,
    "requestedCount" INTEGER NOT NULL DEFAULT 0,
    "generatedCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenerationJob_apiEndpointId_fkey" FOREIGN KEY ("apiEndpointId") REFERENCES "ApiEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "apiEndpointId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "dataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedRow_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneratedRow_apiEndpointId_fkey" FOREIGN KEY ("apiEndpointId") REFERENCES "ApiEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "ApiEndpoint_projectId_idx" ON "ApiEndpoint"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiEndpoint_projectId_slug_key" ON "ApiEndpoint"("projectId", "slug");

-- CreateIndex
CREATE INDEX "GenerationJob_apiEndpointId_idx" ON "GenerationJob"("apiEndpointId");

-- CreateIndex
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");

-- CreateIndex
CREATE INDEX "GeneratedRow_apiEndpointId_rowIndex_idx" ON "GeneratedRow"("apiEndpointId", "rowIndex");

-- CreateIndex
CREATE INDEX "GeneratedRow_generationJobId_idx" ON "GeneratedRow"("generationJobId");
