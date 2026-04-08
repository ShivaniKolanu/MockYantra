/*
  Warnings:

  - You are about to drop the `ApiEndpoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeneratedRow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GenerationJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `slug` on the `Project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ApiEndpoint_projectId_slug_key";

-- DropIndex
DROP INDEX "ApiEndpoint_projectId_idx";

-- DropIndex
DROP INDEX "GeneratedRow_generationJobId_idx";

-- DropIndex
DROP INDEX "GeneratedRow_apiEndpointId_rowIndex_idx";

-- DropIndex
DROP INDEX "GenerationJob_status_idx";

-- DropIndex
DROP INDEX "GenerationJob_apiEndpointId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ApiEndpoint";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GeneratedRow";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GenerationJob";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Api" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "description" TEXT,
    "responseSchema" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Api_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("baseUrl", "createdAt", "description", "id", "name", "updatedAt") SELECT "baseUrl", "createdAt", "description", "id", "name", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Api_projectId_idx" ON "Api"("projectId");
