# Easy Livin CRM — Phase 2 Complete

## Pages built

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login with demo credentials | Public |
| `/forgot-password` | Password reset request | Public |
| `/dashboard` | Stats, pipeline chart, recent leads, activity | All staff |
| `/properties` | Full table with filters, approve button | All staff |
| `/properties/new` | Add property — 4-tab form | All staff |
| `/properties/:id/edit` | Edit property | All staff |
| `/leads` | Lead pipeline — table with inline stage changer | All staff |
| `/leads/:id` | Full lead detail — timeline, stage progress, quick actions | All staff |
| `/upload` | Drag & drop CSV/Excel upload, batch history | Admin only |
| `/agents` | Agent cards, register modal, activate/suspend | Admin only |
| `/reports` | Charts — trends, sources, agent performance | Admin only |
| `/settings` | Profile, password, notifications, integrations | All staff |

## How to run

```bash
cd easyliving-crm
npm install
npm run dev
# → http://localhost:3001
```

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Urmilla) | admin@easylivingoa.com | Admin@123 |
| Agent (Rahul) | rahul@easylivingoa.com | Agent@123 |
| Agent (Priya) | priya@easylivingoa.com | Agent@123 |

## Agent scoping — how it works

- Agents log in → see only properties where `agent.id === user.id`
- Agents see only leads where `assignedTo.id === user.id`  
- Admin logs in → `isAdmin = true` → all queries skip the scope filter
- The `getPropertiesForUser()` and `getLeadsForUser()` helpers in `lib/data.ts` enforce this

## Phase 3 — what to wire

Every `// TODO Phase 3:` comment in the codebase marks where a mock/simulation
needs to be replaced with a real API call. Key places:

1. `lib/auth.tsx` → replace MOCK_USERS with `POST /api/auth/login`
2. `leads/page.tsx` → replace MOCK_LEADS with `GET /api/leads`
3. `properties/page.tsx` → replace MOCK_PROPERTIES with `GET /api/properties`
4. `upload/page.tsx` → replace simulation with `POST /api/uploads/properties`
5. `agents/page.tsx` → replace mock register with `POST /api/auth/register`
