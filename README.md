# MockYantra

AI-powered mock API generation and hosting for fast frontend and integration testing.

MockYantra helps you create mock APIs in two ways:
- AI mode: generate API shape and sample data from a prompt.
- Manual mode: define schema fields and generate sample records.

Once created, APIs can be activated and served from public-style mock routes.

## Highlights

- Next.js App Router backend and UI in one project.
- Gemini-powered API generation with structured JSON validation.
- Project-level API organization with SQLite persistence via Prisma.
- Public mock route handler supporting GET, POST, PUT, PATCH, DELETE.
- Dashboard view for API activity and project insights.

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Prisma 7 + better-sqlite3
- MUI 7 + MUI X Charts
- Zod
- Gemini API (`@google/genai`)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root (`frontend/`) with:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash-lite"
```

Notes:
- `GEMINI_MODEL` is optional. The app defaults to `gemini-2.5-flash-lite`.
- Local runtime uses `dev.db` in the project root.

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional Seed Data

To populate demo-ready projects and APIs:

```bash
node scripts/seed_dashboard_data.js
```

## Core API Endpoints

### Create and list projects
- `GET /api/projects`
- `POST /api/projects`

### Create APIs inside a project
- `POST /api/projects/:projectId/apis`

Payload supports:
- `mode: "ai" | "manual"`
- AI fields: `aiPrompt`, `aiFields`, `recordCount`
- Manual fields: `name`, `method`, `endpointPath`, `description`, `responseSchema`, `recordCount`

### API details and activation
- `GET /api/apis/:apiId`
- `PATCH /api/apis/:apiId` with `{ "isActive": true | false }`

### Public mock route
- `/:projectCode/:resourcePath`
- Methods supported: GET, POST, PUT, PATCH, DELETE

Example:
- `GET /commerce-suite/orders`

## How It Works

1. Create a project with a unique project code.
2. Create an API using AI mode or manual schema mode.
3. Activate the API from the API view.
4. Call the generated mock path to get sample JSON data.

## Project Structure

```text
app/
	api/                     # Internal API routes for projects/APIs/AI
	(public-mock)/[...mockPath]/route.ts  # Public mock handler
	components/              # Dashboard and builder UI
lib/
	prisma.ts                # Prisma client initialization
	server/services/gemini.ts# AI generation service
prisma/
	schema.prisma            # Data models
	migrations/              # Database migrations
scripts/
	seed_dashboard_data.js   # Demo data seeding
```

## Current Scope

This version focuses on core mock API workflows:
- rapid API creation,
- schema-driven sample data,
- activation and serving,
- local persistence.

Potential next upgrades:
- automated tests,
- CI pipeline,
- auth and rate limiting,
- containerized deployment.

