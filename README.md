# GreenPulse AI — Enterprise Device Lifecycle Intelligence Platform

Two projects in this delivery:

- `greenpulse-ai/` — React 19 + Vite + TypeScript frontend
- `greenpulse-api/` — Express + PostgreSQL + Prisma backend

## Running the frontend against mock data (no backend needed)

```bash
cd greenpulse-ai
npm install
npm run dev
```

`VITE_USE_MOCK` defaults to `true`, so every page works fully against the
mock JSON in `src/mock/` via the same API layer (`src/api/*.ts`) that will
later call the real backend. Login accepts any email + a 4+ character
password.

## Running the real backend

```bash
cd greenpulse-api
cp .env.example .env        # then edit DATABASE_URL if needed
npm install
npm run prisma:migrate      # creates tables
npm run seed                # populates a demo company, user, and 38 devices
npm run dev                 # starts on http://localhost:4000
```

Seeded login: `rohit.sharma@acmeglobal.com` / `password123`

## Connecting the frontend to the real backend

```bash
cd greenpulse-ai
cp .env.example .env
# edit .env:
#   VITE_USE_MOCK=false
#   VITE_API_BASE_URL=http://localhost:4000/api
npm run dev
```

No component or hook changes — `src/lib/apiClient.ts` is the single place
that switches between mock resolvers and real `fetch` calls.

## What's implemented

**Frontend**: all 11 pages, full component library (Sidebar, Navbar,
SearchBar, StatCard, ActionPlanCard, DeviceTable w/ sort+filter+search+
pagination+loading+empty states, AI Copilot panel w/ streaming replies,
MaintenanceTimeline, charts, badges, skeletons), Zustand UI store, TanStack
Query hooks, RHF+Zod forms (Login, Settings, new-ticket), route guard.

**Backend**: Express app with helmet/cors/rate-limiting, JWT auth, Prisma
schema covering every entity the frontend needs, real Postgres-backed CRUD
for devices/maintenance/alerts/tickets, a rule-based recommendation/
prediction engine and copilot reply engine (both isolated in single
functions so they're a clean drop-in point for a real ML model or LLM call
later), and a seed script producing realistic demo data.

## Known gaps to flag honestly

- Dashboard trend arrays fall back to a flat line until `DeviceHealthPoint`
  history accumulates — noted with a TODO in `dashboardService.ts`.
- The recommendation/prediction/copilot "AI" is rule-based, not a trained
  model or LLM call — intentionally isolated so swapping in a real one is a
  one-file change.
- I could not run `npm install`, start a dev server, or hit a live database
  in this sandbox (no network access), so this hasn't been executed
  end-to-end — only reviewed for correctness. Run it locally to confirm.
