# Easy Livin Goa — Architecture Documentation

## Overview

This is a **monorepo** containing three deployable applications and two shared packages.

```
easyliving-goa/
├── apps/
│   ├── web/          → Public website (easylivingoa.com)
│   └── crm/          → Internal CRM (crm.easylivingoa.com)
├── packages/
│   ├── api/          → Backend REST API (api.easylivingoa.com)
│   ├── database/     → Prisma schema + client + seed
│   └── shared/       → Types, validators, constants, utilities
└── docs/             → This documentation
```

## Why a Monorepo?

All three apps share the same types (from `@easyliving/shared`) and talk to the same database (via `@easyliving/database`). A monorepo means:
- **One `npm install`** sets up everything
- **TypeScript types flow between packages** — change a validator in `shared`, TypeScript immediately flags mismatches in `api`, `web`, and `crm`
- **Turborepo** handles build ordering and caching — it knows `api` depends on `database` and builds them in the right order

## Data Flow

```
Public Website (Next.js)
    └── enquiry form → POST /api/enquiries
                            └── creates Enquiry + Lead records in PostgreSQL

CRM App (Next.js)
    └── agent logs in → POST /api/auth/login → gets JWT
    └── views leads   → GET /api/leads (scoped by agent role)
    └── uploads Excel → POST /api/uploads/properties (admin only)

Backend API (Express)
    └── validates JWT on every protected route
    └── checks role on role-restricted routes
    └── enforces agent scope in every DB query
    └── PostgreSQL via Prisma ORM
```

## Role-Based Access Control (RBAC)

The `authenticate` middleware verifies the JWT and attaches `req.user`.
The `authorize(...roles)` middleware checks `req.user.role` against the allowed list.

**Critical**: Agent scoping is enforced at the **database query level**, not just in middleware. Every `findMany` for properties and leads includes a `WHERE assigned_agent_id = current_user.id` clause when the user is a SALES_EXECUTIVE. This means even if the middleware is accidentally bypassed, the DB query still only returns the agent's own data.

## Database Design Decisions

### Why PostgreSQL (not MongoDB)?
- Properties → PropertyAgents (many-to-many) → Leads are inherently relational
- We need JOIN queries (e.g. "show leads for properties in North Goa assigned to agent X")
- Prisma gives us full TypeScript types generated from the schema

### Why Prisma?
- Type-safe queries — impossible to write `prisma.user.findUnique({ where: { notAField: '' } })` — TypeScript catches it
- `schema.prisma` is the single source of truth — the DB schema and the TypeScript types are always in sync
- Migrations are tracked in `prisma/migrations/` — you can see exactly what changed in the DB over time

### Slug fields on Properties
Every property has a `slug` (e.g. `luxury-villa-vagator-north-goa`). This is used in:
1. The public URL: `easylivingoa.com/property/luxury-villa-vagator-north-goa`
2. SEO (the URL is descriptive and keyword-rich)
3. Avoiding ID exposure in public URLs

## Authentication

We use **short-lived JWT access tokens** (15 minutes) + **long-lived refresh tokens** (30 days).

- Access token: sent as `Authorization: Bearer <token>` header. Short-lived so stolen tokens expire quickly.
- Refresh token: used only to get new access tokens. Stored as a bcrypt hash in the DB so plain tokens are never stored.
- **Token rotation**: every time a refresh token is used, it's replaced with a new one. If an old refresh token is used, it means someone stole it and used it — the system invalidates all sessions for that user.

## Bulk Upload Flow

1. Admin uploads `.xlsx` or `.csv` file to `POST /api/uploads/properties`
2. Multer stores it in memory (never touches disk)
3. SheetJS (`xlsx` library) parses the buffer into an array of row objects
4. Each row is normalised (handles different header spellings) then validated with Zod
5. Valid rows are inserted as `PENDING_APPROVAL` properties linked to an `UploadBatch` record
6. Admin reviews and approves individually or in bulk
7. The `UploadBatch` record shows exactly which rows succeeded and which failed (with error messages)

## Adding a New Feature (Checklist)

1. **DB change?** → Edit `packages/database/prisma/schema.prisma`, run `npm run db:migrate:dev`
2. **New API endpoint?** → Add to appropriate route file in `packages/api/src/routes/`
3. **New validator?** → Add to `packages/shared/src/validators/index.ts`
4. **New constant?** → Add to `packages/shared/src/constants/index.ts`
5. **Write tests** in `packages/api/tests/unit/` or `tests/integration/`
6. **CRM UI?** → Add page in `apps/crm/src/app/(dashboard)/`
7. **Public site UI?** → Add page in `apps/web/src/app/(public)/`

## Environment Variables

See `.env.example` for the full list. The API validates all env vars at startup using Zod — it will refuse to start with a helpful error message if anything is missing.

## Deployment

- `easylivingoa.com` → Vercel (Next.js web app)
- `crm.easylivingoa.com` → Vercel (Next.js CRM app)
- API → Vercel Serverless Functions or Railway (Node.js)
- Database → Railway PostgreSQL or Supabase
- Images/Videos → Cloudinary

## Phase Readiness

| Phase | Status | Blocker |
|-------|--------|---------|
| 1 — Core (website + CRM + upload) | ✅ Ready to build | None |
| 2 — WhatsApp | 🔜 Planned | Client needs WhatsApp Business API account |
| 3 — Facebook/Instagram | 🔜 Planned | Client needs Meta Business verification |
| 4 — MagicBricks/99acres | 🔜 Planned | Client needs paid Channel Partner accounts |
| 5 — LinkedIn/YouTube | 🔜 Planned | LinkedIn API approval (takes time) |
