# IT Admin Package Console Handoff - 2026-06-18

## Current Scope

The IT Backoffice package menu now focuses on the standard SSTiPOS POS package table and the tenant contract registry.

Primary routes:

- `/it-admin/packages`
- `/it-admin/packages/[packageCode]`
- `/api/it-admin/packages/[packageCode]/contracts`
- `/api/it-admin/admin/tenants/[tenantId]/contract`

## UI State

- The package overview page shows only the package cards and feature matrix.
- The previous large hero/promo section was removed from `/it-admin/packages`.
- Package cards are clickable and navigate to the package detail page.
- The sidebar can be collapsed on desktop to icon-only mode.
- The sidebar no longer renders the `SSTiPOS` / `SSTiPOS Support` text block under the logo.
- Sidebar collapse state is persisted in `localStorage` under `sstipos-support-sidebar-collapsed`.

## Standard Package Source

The standard package table from the business image is stored in:

- `apps/backoffice-web/src/lib/it-admin-package-standards.ts`

Current package codes:

- `launch_lite`
- `starter`
- `standard`
- `pro`
- `business`

## Contract Registry Behavior

The package detail API reads:

- `subscription_packages`
- `tenant_subscription_contracts`
- `tenants`
- `branches`
- `subscription_package_features`
- `package_feature_catalog`
- `tenant_feature_subscriptions`

The UI shows:

- contract number
- tenant code
- tenant name
- contract status
- branch/device/user scope
- enabled package features
- contract start date

Current contract number format is generated in code:

`SST-{tenantCode}-{year}-{contractIdPrefix}`

## Demo POS Package Binding

`supabase/seed.sql` now seeds the standard IT Admin package set and the POS feature gate matrix used by server-side enforcement.

Demo tenant contracts:

- `NDL-TH-001` -> `standard` (`/it-admin/packages/standard`)
- `BBQ-TH-002` -> `pro` (`/it-admin/packages/pro`)

These contracts are active SaaS/monthly contracts and drive the same resolution path used by POS APIs:

1. latest active tenant contract
2. `subscription_package_features`
3. tenant-level `tenant_feature_subscriptions`
4. branch-level `tenant_feature_subscriptions`

Opening or closing features from the IT Admin tenant feature panel writes tenant overrides, invalidates the feature-gate cache, and affects POS/API access for that tenant.

## 2026-06-18 Package Change and Latency Guard Update

- The package detail console now uses request timeouts for contract loading, tenant feature loading, feature saves, and package changes. If an API call takes too long, the UI returns a readable error instead of appearing stuck.
- Store rows now include a `Change Package` / `เปลี่ยนแพ็กเกจ` action. It opens a modal, loads active packages from `/api/it-admin/admin/tenants/[tenantId]/contract`, and saves the selected package through the same route.
- Package changes update the active tenant contract package, amount per billing cycle, branch/device/user limits, and `tenants.package_id`.
- Package changes invalidate the feature-gate cache so POS and store back office requests resolve the new entitlements immediately.
- Package assignment/change writes `plan_assigned` or `plan_changed` audit log entries with before/after contract data and target plan metadata.
- Package, feature-list, summary, and feature-management dialogs are now mutually exclusive in the package detail console to avoid stacked modal states.

## Recommended Next Work

1. Add a real `contract_no` column to `tenant_subscription_contracts` if the business needs stable accounting contract numbers.
2. Promote the demo package/feature seed into an explicit data migration if production DB should match the standard package table exactly.
3. Add IT Admin integration tests for `/api/it-admin/packages/[packageCode]/contracts`.
4. Add integration tests for package transfer using `/api/it-admin/admin/tenants/[tenantId]/contract`.
5. Add branch ownership validation in feature override and user role mutation paths before go-live.

## Verification Commands

Run before continuing:

```powershell
pnpm --filter backoffice-web typecheck
pnpm --filter backoffice-web lint
pnpm --filter backoffice-web test -- --cache false
pnpm --filter backoffice-web build
```
