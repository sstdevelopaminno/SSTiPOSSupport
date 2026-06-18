# Project Structure Audit - 2026-06-18

## Purpose

This audit re-checks the SSTiPOS Support repository structure, current documentation, verification status, and next development priorities before the next implementation pass.

The working rule for future development remains:

- Every code change, system fix, or development pass must update the relevant documentation in the same branch.
- The documentation update must include current status, changed files, verification results, risks, and recommended next steps.
- Do not run Vercel deployment commands unless explicitly requested.
- This Support repository must keep default runtime behavior on the IT Support surface.

## Repository Status

- Workspace: `E:\SSTiPOSSupport`
- Current branch: `codex/it-admin-package-contracts`
- Git status before this documentation update: clean branch output with no listed modified files.
- Latest inspected commits:
  - `1e521db Add IT admin package contracts`
  - `e970ee6 Document production login deployment`
  - `616bece Document Vercel env login blocker`
  - `cbc081a Fix IT support demo login`
  - `200e42a fix: stop clearing support storage on login`

## Runtime and Surface Model

The repository is the separated SSTiPOS Support codebase, not the POS/Sales runtime repository.

- Main app: `apps/backoffice-web`
- Default local command: `pnpm dev` or `pnpm dev:it-support`
- Default local IT URL: `http://localhost:30000/it-admin/login`
- Required surface: `APP_SURFACE=it_admin`
- Production project/domain: `sstipos-support`, `https://sstipos-support.vercel.app`
- Database: same existing Supabase project/database as POS; do not create an IT-only Supabase project.

POS/Sales code and APIs still exist in this checkout until the repository split is physically deeper. They must stay blocked from the Support public surface by `APP_SURFACE=it_admin`, `src/proxy.ts`, and server-side guards.

## Structure Map

```text
apps/
  backoffice-web/        Next.js App Router app for IT Backoffice, backoffice, POS preview, login, and APIs
  pos-android/           Android contract/docs placeholder
packages/
  pos-domain/            POS/package domain logic
  shared-types/          Shared TypeScript types
  ui/                    Shared UI package placeholder/components
supabase/
  migrations/            Canonical shared migration history; keep in sync with POS repo
  seeds/                 Demo/seed data
  manual/                Manual SQL utilities
docs/
  *.md                   Architecture, runbooks, audits, handoffs, QA evidence, deployment notes
scripts/
  *.mjs                  QA, smoke, seed, reset, and local proxy helpers
```

## Key Documents Rechecked

- `README.md`
- `context.md`
- `docs/AI-HANDOFF-IT-BACKOFFICE-2026-06-12.md`
- `docs/IT-ADMIN-PACKAGE-CONSOLE-HANDOFF-2026-06-18.md`
- `docs/PRODUCTION-DEPLOYMENT-OPERATIONS-INDEX.md`
- `docs/current-stability-audit.md`
- `docs/final-implementation-audit.md`

Important note: several long audit documents are large enough that full shell reads can time out. Their leading sections still confirm the same status: improved but not yet 100% production/go-live complete.

## Current IT Admin Surface Map

Primary route groups:

- `apps/backoffice-web/src/app/(it-admin)/`
- `apps/backoffice-web/src/app/it-admin/login/page.tsx`
- `apps/backoffice-web/src/app/api/it-admin/`
- `apps/backoffice-web/src/components/it-admin/`

Important IT Admin API files:

- `api/it-admin/auth/login/route.ts`
- `api/it-admin/admin/tenants/route.ts`
- `api/it-admin/admin/tenants/[tenantId]/branches/route.ts`
- `api/it-admin/admin/tenants/[tenantId]/contract/route.ts`
- `api/it-admin/admin/tenants/[tenantId]/features/route.ts`
- `api/it-admin/admin/tenants/[tenantId]/users/route.ts`
- `api/it-admin/packages/[packageCode]/contracts/route.ts`
- `api/it-admin/customer-display/policies/route.ts`

Important IT Admin components:

- `it-admin-login-form.tsx`
- `it-support-shell.tsx`
- `tenant-index-console.tsx`
- `tenant-section-console.tsx`
- `package-billing-console.tsx`
- `package-contracts-console.tsx`
- `platform-audit-logs-console.tsx`
- `customer-display-admin-console.tsx`

## What Looks Current

- IT Support repo defaults are documented as `APP_SURFACE=it_admin`.
- `context.md` exists and remains the authoritative handoff file.
- `README.md` includes the GitHub documentation sync rule.
- The latest package console handoff exists at `docs/IT-ADMIN-PACKAGE-CONSOLE-HANDOFF-2026-06-18.md`.
- Package detail and contract APIs now exist for:
  - `/api/it-admin/packages/[packageCode]/contracts`
  - `/api/it-admin/admin/tenants/[tenantId]/contract`
- `it-admin-guard.ts` now returns a safe generic message for unexpected internal errors instead of exposing raw unexpected error messages.
- Contract package changes validate that the selected plan exists and is active before writing.

## Remaining P1 Gaps

1. Tenant index readiness is still thin.
   - `api/it-admin/admin/tenants/route.ts` returns tenant basics, branch count, and active session count.
   - It does not yet expose latest contract status, active package, expired/no-contract state, or effective `core_pos_sales` readiness.
   - `tenant-index-console.tsx` does not show contract/package/core feature readiness.

2. Feature override branch scope validation is still incomplete.
   - `api/it-admin/admin/tenants/[tenantId]/features/route.ts` accepts `branch_id` in GET/PATCH.
   - It scopes override queries by `tenant_id` and `branch_id`, but it does not explicitly validate that the branch belongs to the route tenant before read/write.
   - Add rejection tests for cross-tenant branch IDs.

3. User role assignment validation is still incomplete.
   - `api/it-admin/admin/tenants/[tenantId]/users/route.ts` loads the target profile and restricts `it_support` from managing platform users.
   - It does not explicitly validate that the submitted branch belongs to the route tenant before write.
   - It does not clearly reject inactive/missing tenant users before assignment.
   - Add rejection tests for cross-tenant branch IDs, inactive users, non-tenant users, and support-role restrictions.

4. Focused IT Admin tests are still incomplete.
   - Existing tests include `it-admin-auth-login.integration.test.ts`.
   - No focused tests were found for package contracts, feature branch-scope rejection, user role branch-scope rejection, quota rejection, inactive/no-contract behavior, or permission rejection.

5. Monitoring/readiness remains document-led.
   - The IT monitoring page exists, but production readiness evidence is not yet a complete IT Admin readiness dashboard.
   - Previous docs also flag monitor endpoint performance as an operational risk.

## P2 Follow-Up Work

- Add safer Thai/English confirmation flows for sensitive actions:
  - device approve/revoke/block
  - session revoke
  - shift close/suspend
  - branch/device/user role mutations
  - feature toggles
- Replace raw ID-heavy workflows with selector/search flows where operators need readable tenant, branch, and user context.
- Add audit export/evidence workflow for production support operations.
- Review any mojibake-looking Thai strings in shell output inside an editor before UI text edits.

## Verification Run

Commands run on 2026-06-18:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 24 test files / 59 tests.
- `npm run build`: inconclusive locally. It timed out twice with no returned build output:
  - first timeout around 184 seconds
  - second timeout around 364 seconds

After the build timeouts, the short-lived node processes started during the build run had exited. Older node processes from earlier in the day were still present and were not killed because they may belong to another local session.

## Recommended Next Development Order

1. Add tenant readiness data to `api/it-admin/admin/tenants/route.ts`.
   - Include latest contract/package state.
   - Include effective `core_pos_sales` readiness.
   - Surface no-contract, inactive, expired, suspended, tenant inactive, and feature disabled states.

2. Update `tenant-index-console.tsx` to show readiness clearly.
   - Keep the UI dense and operational.
   - Avoid marketing-style hero/card layouts.
   - Show actionable status per tenant.

3. Harden feature override branch scope.
   - Validate branch ownership in GET/PATCH before reading or writing branch-scoped overrides.
   - Add integration tests for cross-tenant branch rejection.

4. Harden user role assignment.
   - Validate branch ownership before POST/PATCH.
   - Validate target user exists, is active, and is a tenant user before assignment.
   - Add integration tests for branch scope, user state, quota, and permission rejection.

5. Add contract/package tests.
   - Package detail contracts API.
   - Tenant contract PATCH package change.
   - Inactive package rejection.
   - Feature cache invalidation/audit expectations where practical.

6. Re-run:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

If local build still times out, capture the build stage/logs separately before deciding whether it is a real build regression or a local process/runtime issue.

## Documentation Requirement for Next Pass

For the next implementation pass, update this audit or create a dated handoff document before final handoff. The update must state:

- files changed
- behavior changed
- verification commands and results
- risks left open
- next recommended step

---

## IT Support Sidebar UI Update - 2026-06-18

### Request

Adjust the IT Support sidebar based on the provided screenshot:

- Remove the repeated `IT Admin` badge/image area under the SST Innovation logo.
- Hide the three-line sidebar collapse control by default.
- Reveal the three-line control when the operator moves the mouse over, focuses, or taps the sidebar area.

### Files Changed

- `apps/backoffice-web/src/components/it-admin/it-support-shell.tsx`
- `apps/backoffice-web/src/app/globals.css`
- `docs/PROJECT-STRUCTURE-AUDIT-2026-06-18.md`

### Behavior Changed

- The sidebar no longer renders the role badge under the logo.
- The sidebar collapse button remains available for desktop sidebar collapse/expand, but is visually hidden by default.
- The collapse button becomes visible when the sidebar is hovered, focused, or touched.
- Touch reveal auto-hides again after a short delay.
- Mobile drawer behavior is unchanged; the collapse button remains hidden inside the mobile drawer.

### Verification

Commands/results:

- `npm run typecheck`: passed.
- `npm run lint`: first run timed out at 124 seconds without returning a result; second run passed.
- Dev server check:
  - Attempted to start with `Start-Process npm`; Windows opened an unexpected `notepad` process, so that attempt was discarded.
  - Started via `Start-Process cmd.exe /c npm run dev`.
  - `Test-NetConnection localhost:30000` returned `TcpTestSucceeded=True`.
  - `curl http://localhost:30000/it-admin/login` returned `307 Temporary Redirect` to `/it-admin`, which matches the current authenticated/session state in this local environment.
  - A direct curl to `/it-admin` did not return a payload within the local timeout, likely due to the authenticated server-side data path rather than the sidebar CSS/TSX edit.

Browser automation was not completed because the `agent-browser` callable tool was not available in this session after tool discovery.

### Remaining Risk

- Visual verification in a real browser should still be done on `http://localhost:30000/it-admin` with an IT Admin session to confirm the hover/touch reveal feels right on the target device.

---

## IT Support Sidebar Active/Scrollbar Update - 2026-06-18

### Request

Adjust the IT Support sidebar based on the follow-up screenshot:

- Menu highlight color should appear only for the menu item that is clicked/active.
- The vertical scrollbar in the sidebar menu should be hidden by default.
- The scrollbar should show only when the operator hovers, focuses, or touches the sidebar.

### Files Changed

- `apps/backoffice-web/src/components/it-admin/it-support-shell.tsx`
- `apps/backoffice-web/src/app/globals.css`
- `docs/PROJECT-STRUCTURE-AUDIT-2026-06-18.md`

### Behavior Changed

- Sidebar active menu state now tracks the full menu href, including hash fragments such as `/tenants#branches`.
- Clicking a sidebar menu item immediately marks only that item as active.
- On route/hash changes, the sidebar syncs active state from the current URL.
- Non-active menu hover no longer adds the blue pill border/background; the full blue highlight is reserved for `.is-active`.
- The sidebar menu scrollbar is hidden by default.
- The scrollbar is revealed when the sidebar is hovered, focused, or touched, using the same reveal state as the sidebar controls.

### Verification

Commands/results:

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Initial parallel verification attempts timed out without returning output; rerunning the commands sequentially completed successfully.

### Remaining Risk

- Visual verification should still be done on the target touch device/browser to confirm the scrollbar reveal timing and active menu behavior feel correct.

---

## Tenant Management Topbar Removal - 2026-06-18

### Request

Begin improving the `การจัดการผู้เช่า` / Tenant Management menu by removing the top title band shown in the second screenshot.

### Files Changed

- `apps/backoffice-web/src/components/it-admin/it-support-shell.tsx`
- `apps/backoffice-web/src/app/globals.css`
- `docs/PROJECT-STRUCTURE-AUDIT-2026-06-18.md`

### Behavior Changed

- The shared `SSTiPOS Support Console` topbar is hidden only on the root tenant management route: `/tenants`.
- Other IT Admin routes continue to show the shared topbar.
- A compact fallback menu button is rendered when the topbar is hidden, but CSS keeps it visible only in mobile/tablet layouts where the drawer trigger is needed.

### Verification

Commands/results:

- `npm run typecheck`: passed.
- `npm run lint`: passed.

### Remaining Risk

- Visual verification on `/tenants` should confirm the page now starts directly with the tenant table surface and that mobile/tablet users can still open the sidebar drawer.

---

## Tenant Management I18n Update - 2026-06-18

### Request

Update the Tenant Management page so visible labels support both Thai and English through the existing i18n system.

### Files Changed

- `apps/backoffice-web/src/lib/i18n.ts`
- `apps/backoffice-web/src/app/(it-admin)/tenants/page.tsx`
- `apps/backoffice-web/src/components/it-admin/tenant-index-console.tsx`
- `docs/PROJECT-STRUCTURE-AUDIT-2026-06-18.md`

### Behavior Changed

- Added Thai/English translation keys for the Tenant Management surface:
  - page title and description
  - table headers
  - active/inactive status labels
  - action buttons
  - refresh/loading/empty/error copy
  - forbidden permission copy
- The `/tenants` server page now reads the current language with `getCurrentLanguage()` and passes translated labels into the client tenant console.
- `TenantIndexConsole` no longer hardcodes English UI labels.
- The tenant console load handler now uses `useCallback` so React hook dependency checks stay clean.

### Verification

Commands/results:

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings after the `useCallback` cleanup.

### Remaining Risk

- Browser verification should switch the language selector between Thai and English on `/tenants` to confirm all visible tenant-table text changes as expected.
