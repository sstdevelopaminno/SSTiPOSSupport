# Vercel Deployment Runbook

## Project-to-Domain Mapping
- SSTiPOS Support repository: `sstdevelopaminno/SSTiPOSSupport`
  - Vercel project: `sstipos-support`
  - Production alias: `https://sstipos-support.vercel.app`
  - Required surface: `APP_SURFACE=it_admin`
- POS/Sales repository: `sstdevelopaminno/POS-Preview`
  - Production POS domain is managed from the POS repository/project, not this Support repo.

## Environment Separation
- Development:
  - Local machine + `apps/backoffice-web/.env.local`.
  - Support runtime command: `pnpm dev` or `pnpm dev:it-support`.
  - Support local URL: `http://localhost:30000/it-admin/login`.
- Preview:
  - Auto-created from PR deployments.
  - Uses preview env vars for the `sstipos-support` Vercel project.
- Production:
  - `main` branch deployment for the `sstipos-support` Vercel project.
  - Uses the same existing Supabase project/database as POS.

## Required Security Environment Variables
- `APP_SURFACE=it_admin`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PRIMARY_URL`
- `SUPABASE_PRIMARY_ANON_KEY`
- `SUPABASE_PRIMARY_SERVICE_ROLE_KEY`
- `POS_SESSION_HANDOFF_SECRET`
- `POS_PUBLIC_RATE_LIMIT_WINDOW_SECONDS`
- `POS_STORE_RESOLVE_RATE_LIMIT_MAX`
- `POS_STORE_LOGIN_CONTEXT_RATE_LIMIT_MAX`
- `POS_LOGIN_RATE_LIMIT_IP_MAX`
- `POS_LOGIN_RATE_LIMIT_DEVICE_MAX`

## Vercel Linking Steps
1. Link this checkout to the `sstipos-support` Vercel project.
2. If the Vercel Project Root Directory is the repository root, use root `vercel.json`.
3. If the Vercel Project Root Directory is `apps/backoffice-web`, use `apps/backoffice-web/vercel.json`.
4. Configure production env vars on the Support project with `APP_SURFACE=it_admin`.
5. Do not point the Support project at a separate Supabase database.

## Git Branch to Deploy Target
- `main` -> Production deployment.
- `develop` -> Preview/Staging deployment.
- `feature/*` -> Preview deployment.
- `hotfix/*` -> Preview first, then merge to `main` for Production.

## Deployment Verification
After each production deployment:
1. Verify `/` redirects to `/it-admin/login`.
2. Verify `/it-admin/login` returns `200`.
3. Verify `/login/store` redirects to `/it-admin/login?blocked=pos_surface`.
4. Verify `/sw.js` returns the Support cleanup worker with no-store headers.
5. Verify `/manifest.webmanifest` returns `404` on the Support domain.
6. Check logs for elevated 4xx/5xx after deploy.

## Rollback
- Use Vercel dashboard or CLI rollback to previous known-good deployment.
- Keep database schema compatibility in mind before rollback.
