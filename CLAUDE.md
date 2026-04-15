## Project Overview

**FeatureFlow** is a feature flag management platform that allows teams to ship faster and safer with real-time feature flags, gradual rollouts, and targeted releases.

- **Backend**: Express.js API (Node.js with ESM modules)
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Caching/Pub-Sub**: Upstash Redis
- **Job Queue**: pg-boss
- **Email**: Resend

## Quick Start Commands

### Backend Development
```bash
cd backend
npm install
npm run dev        # Start dev server with auto-reload (port 8000)
npm start          # Production mode
npm test           # Run tests (Jest + supertest)
npm test -- --watch  # Watch mode tests
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev        # Start dev server (port 3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### Environment Setup
- Create `.env` files in both `backend/` and `frontend/` directories
- Backend env vars: `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `DATABASE_URL`, `RESEND_API_KEY`, `FRONTEND_URL`
- Frontend env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`

## Architecture Overview

### Backend Structure (`backend/src/`)

```
backend/src/
├── server.js                  # Entry point; starts Express app, Redis, queue, workers
├── api/
│   └── app.js                # Express app configuration, middleware setup, routes mounting
├── config/
│   ├── env.js                # Centralized environment variables
│   ├── supabase.js           # Supabase client initialization
│   ├── redis.js              # Upstash Redis connection
│   └── queue.js              # pg-boss job queue setup
├── modules/                   # Feature-based domain modules
│   ├── auth/                 # User signup/login (delegates to Supabase Auth)
│   ├── projects/             # Project CRUD and management
│   ├── flags/                # Flag CRUD, targeting rules, audit logs, scheduling
│   ├── sdk/                  # Client SDK endpoints for flag evaluation
│   │   └── rulesEngine.js    # Core flag evaluation logic (rules + rollout %)
│   └── usage/                # Flag evaluation metrics tracking
├── shared/
│   ├── middlewares/
│   │   ├── requireAuth.js    # JWT auth middleware (verifies Supabase tokens)
│   │   └── requireApiKey.js  # API key validation middleware for SDK calls
│   └── utils/
│       ├── hash.js           # Consistent hashing for rollout bucket calculation
│       ├── mailer.js         # Email service wrapper
│       └── realtime.js       # Realtime updates helper
└── workers/
    └── flagWorker.js         # Background job handler for scheduled flag toggles
```

**Key Pattern**: Controllers handle business logic, routes define endpoints, middleware provides cross-cutting concerns.

### Frontend Structure (`frontend/app/` and `frontend/features/`)

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout (wraps app with Providers)
│   ├── Providers.tsx        # Client provider: QueryClient, Theme, Toaster
│   ├── globals.css          # CSS variables for theme switching
│   ├── page.tsx             # Landing page
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Signup page
│   ├── dashboard/
│   │   ├── page.tsx         # Dashboard home
│   │   ├── layout.tsx       # Dashboard layout (sidebar, etc.)
│   │   ├── projects/page.tsx
│   │   ├── flags/page.tsx
│   │   ├── flags/[flagId]/page.tsx
│   │   └── settings/        # Settings pages
│   └── landing/             # Landing page components
├── features/                # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx     # HOC/wrapper for protected routes
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── api/              # Auth API client functions
│   ├── flags/
│   │   ├── components/      # Flag management UI
│   │   └── api/index.ts     # Flag API calls (create, update, delete, etc.)
│   ├── project/
│   │   ├── components/ProjectSelector.tsx
│   │   └── api/index.ts     # Project API calls
│   ├── usage/
│   │   └── api/index.ts     # Usage metrics API
│   └── landing/
│       └── components/      # 3D landing scene, navbar
├── store/
│   └── themeStore.ts        # Zustand store for light/dark theme (persisted to localStorage)
```

**Key Pattern**: Features are self-contained with their own components and API layer. Zustand for light client state, React Query for server state.

### Data Flow

1. **Flag Evaluation (SDK)**:
   - Client sends user context (userId, attributes) to `/api/v1/sdk/evaluate`
   - Backend evaluates flag with `rulesEngine.evaluateRules()`:
     - Checks attribute matching (EQUALS, NOT_EQUALS, CONTAINS, GREATER_THAN, LESS_THAN, IN)
     - Applies consistent rollout bucketing for percentage-based rollouts
   - Returns flag status (enabled/disabled)

2. **Authentication**:
   - Client authenticates with Supabase (signup/login endpoints delegate to Supabase Auth)
   - Supabase returns JWT session token
   - Frontend stores token, includes in Authorization header for protected API calls
   - Backend verifies token with `requireAuth` middleware

3. **Background Jobs**:
   - Scheduled flag toggles registered with pg-boss queue
   - `flagWorker.js` processes scheduled jobs
   - Redis used for caching and pub-sub notifications

## Testing

### Backend
- Uses **Jest** + **supertest** for API endpoint testing
- Test setup in `backend/package.json`
- Run: `npm test` or `npm test -- --watch`

### Frontend
- ESLint configured for code quality (`npm run lint`)
- No test runner currently configured; consider adding Jest/Vitest if needed

## Common Development Tasks

### Adding a New Feature Flag Capability
1. Extend `rulesEngine.js` if adding new operators (e.g., regex matching)
2. Add controller methods in `backend/src/modules/flags/flags.controller.js`
3. Add routes in `backend/src/modules/flags/flags.routes.js`
4. Create frontend components in `frontend/features/flags/components/`
5. Add API call wrapper in `frontend/features/flags/api/index.ts`

### Adding a New Targeting Operator
1. Update `evaluateRules()` in `backend/src/modules/sdk/rulesEngine.js` with new `case` in the switch statement
2. Document the operator in the function's JSDoc
3. Test with various user contexts

### Adding Database Schema Changes
1. Create migration in Supabase (use Supabase dashboard or migrations folder if version-controlled)
2. Update Backend controllers to work with new fields
3. Ensure API endpoints return the new data correctly
4. Update Frontend API calls if new fields need to be displayed

### Debugging Flag Evaluation
1. Check `rulesEngine.js` for evaluation logic
2. Verify user context is being passed correctly to `/api/v1/sdk/evaluate`
3. Check targeting rules in the database (via Supabase dashboard)
4. Review audit logs in `flags.controller.js` for toggle history

## Key Implementation Details

### Rules Engine (`backend/src/modules/sdk/rulesEngine.js`)
- Evaluates targeting rules with AND logic (all rules must pass)
- Rollout percentage uses **consistent hashing** via `calculateRolloutBucket()` to ensure same user always gets same flag state
- Incomplete rules (missing attribute, operator, or value) are skipped

### Theme System (`frontend/store/themeStore.ts`)
- Zustand store with `persist` middleware stores theme in localStorage
- CSS data-attribute `data-theme="light|dark"` on `<html>` controls CSS variable switching
- `Providers.tsx` bootstraps saved theme on mount to prevent hydration mismatch

### API Architecture
- All backend routes use `/api/v1/` prefix for versioning
- Protected routes (flags, projects) require `requireAuth` middleware
- SDK routes require `requireApiKey` middleware for client libraries
- CORS configured to allow only the frontend URL

## Database Models (via Supabase)

Expected tables (verify schema in Supabase):
- `users` — Managed by Supabase Auth
- `projects` — User projects
- `flags` — Feature flags with base status (enabled/disabled)
- `targeting_rules` — Flag targeting rules (attribute, operator, value, rollout %)
- `flag_audit_logs` — Audit history (who changed what, when)
- `usage_logs` — Flag evaluation metrics

## Deployment Notes

- Backend listens on `PORT` (default 8000)
- Frontend builds to `.next/` folder
- Both services require `.env` files with secrets (never commit these)
- Redis and pg-boss require external services (Upstash for Redis, PostgreSQL for queue)
- Supabase handles user auth and initial database

## Useful npm Packages Summary

**Backend**: Express, Supabase, Upstash Redis, pg-boss, Resend, Helmet, CORS
**Frontend**: Next.js, React Query (TanStack Query), Zustand, Tailwind CSS, Three.js, Sonner (toasts), Lucide (icons)
