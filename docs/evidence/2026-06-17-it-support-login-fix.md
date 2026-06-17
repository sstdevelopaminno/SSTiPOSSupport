# IT Support Login Fix - 2026-06-17

## Scope

Investigated `/it-admin/login` failures for the local/demo SSTiPOS Support accounts:

| Email | Password | Platform role |
| --- | --- | --- |
| `itadmin@sstipos.local` | `182536` | `it_admin` |
| `itsupport@sstipos.local` | `182536` | `it_support` |

## Root Cause

Two separate issues were found:

1. The checked-in Supabase seed data still used the older `itadmin@platform.local` / `ITAdmin#1234` demo account and did not include `itsupport@sstipos.local`.
2. The active Vercel project `ss-ti-pos-support-backoffice-web` had no environment variables configured. Production login requests returned HTTP 500 because the runtime could not read the primary Supabase URL/keys.

## Changes Made

- Updated `supabase/seed.sql` and `supabase/seeds/seed_demo_noodle_shop.sql` to seed both IT platform accounts with password `182536`.
- Added the IT Support Console credentials to `docs/TEST-ACCOUNTS.md`.
- Added an integration test for `/api/it-admin/auth/login` covering:
  - `it_admin` login allowed
  - `it_support` login allowed
  - `tenant_user` rejected
  - invalid credentials rejected
- Added `supabase/manual/upsert_it_platform_demo_users.sql` for controlled re-application against the shared Supabase DB.

## Database Verification

Verified against Supabase DB project ref `deejlitaivfnsbwqdugy`:

| Email | Password check | Profile role | Active | Email identity |
| --- | --- | --- | --- | --- |
| `itadmin@sstipos.local` | pass | `it_admin` | true | present |
| `itsupport@sstipos.local` | pass | `it_support` | true | present |

## Vercel Runtime Status

The production Vercel project was relinked locally to:

- Project: `ss-ti-pos-support-backoffice-web`
- Production alias: `https://ss-ti-pos-support-backoffice-web.vercel.app`

`vercel env ls` returned no configured environment variables for this project. The login API therefore still requires these production env vars before deployment can fully pass runtime login verification:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_PRIMARY_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_PRIMARY_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_PRIMARY_SERVICE_ROLE_KEY`
- `APP_SURFACE=it_admin`

## Validation Commands

- `corepack pnpm --filter backoffice-web exec vitest run tests/integration/it-admin-auth-login.integration.test.ts`
- `corepack pnpm --filter backoffice-web typecheck`

