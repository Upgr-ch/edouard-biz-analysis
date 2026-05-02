# UpGrade — Édouard

## Overview

Full-stack AI chat app migrated from Lovable.dev/Supabase to Replit's pnpm workspace stack.
Édouard is a French-language AI business consultant persona that analyzes business ideas.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Auth**: Clerk (Replit-managed) via `@clerk/react` (frontend) + `@clerk/express` (backend)
- **AI**: OpenRouter via Replit AI Integrations (`AI_INTEGRATIONS_OPENROUTER_BASE_URL` + `AI_INTEGRATIONS_OPENROUTER_API_KEY`), model `openai/gpt-4o-mini`
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)
- **Build**: esbuild (API server), Vite v7 (frontend)
- **CSS**: Tailwind v3 + PostCSS (configured in `vite.config.ts` via `css.postcss.plugins`)

## Artifacts

| Artifact | Dir | Preview Path | Description |
|---|---|---|---|
| Web app | `artifacts/upgrade-app` | `/` | React + Vite frontend |
| API server | `artifacts/api-server` | `/api` (proxy) | Express API server |

## DB Schema

Tables in `lib/db/src/schema/`:
- `conversations` — user conversation records (`id`, `userId`, `title`, `currentStep`, `createdAt`, `updatedAt`)
- `chat_messages` — per-conversation messages (`id`, `conversationId`, `role`, `content`, `createdAt`)

## Auth Flow

- Anonymous users get up to 6 free messages (stored in `localStorage` via `lib/anonymousChat.ts`)
- After 6 messages, redirected to `/auth` (Clerk `<SignIn>` page)
- On first login, anonymous session migrated via `useAnonMigration` hook → `/api/conversations` + bulk message insert
- Clerk cookies auto-sent with `credentials: "include"` on all API fetches

## API Routes

All routes under `/api`:
- `GET /api/healthz` — health check
- `GET/POST /api/conversations` — list / create conversations (auth required)
- `PATCH/DELETE /api/conversations/:id` — update/delete (auth required)
- `GET/POST /api/conversations/:id/messages` — list / add messages (auth required)
- `POST /api/conversations/:id/messages/bulk` — bulk insert messages (auth required)
- `PATCH /api/conversations/:id/messages/:msgId` — update message content (auth required)
- `POST /api/chat` — invoke AI (anonymous or authenticated)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Env Vars

| Variable | Set by | Purpose |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | Replit Clerk setup | Server-side Clerk key |
| `CLERK_SECRET_KEY` | Replit Clerk setup | Server-side Clerk secret |
| `VITE_CLERK_PUBLISHABLE_KEY` | Replit Clerk setup | Frontend Clerk key |
| `VITE_CLERK_PROXY_URL` | Replit (prod only) | Clerk proxy URL |
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | Replit AI Integrations | OpenRouter endpoint |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | Replit AI Integrations | OpenRouter auth key |
| `DATABASE_URL` | Replit PostgreSQL | DB connection string |

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
