import { TenantIndexConsole } from "@/components/it-admin/tenant-index-console";
import { getAuthContext } from "@/lib/auth-context";
import { getCurrentLanguage, t } from "@/lib/i18n";
import { hasItAdminPermission, isItAdminPlatformRole } from "@/lib/it-admin-guard";

export default async function TenantsRootPage() {
  const lang = await getCurrentLanguage();
  const auth = await getAuthContext({ requireBranchScope: false }).catch(() => null);
  if (!auth || !isItAdminPlatformRole(auth.platformRole) || !hasItAdminPermission(auth.platformRole, "tenant_manage")) {
    return (
      <section className="surface">
        <h2>{t(lang, "tenant_management_forbidden_title")}</h2>
        <p>{t(lang, "tenant_management_forbidden_desc")}</p>
      </section>
    );
  }

  return (
    <TenantIndexConsole
      labels={{
        title: t(lang, "tenant_management_title"),
        desc: t(lang, "tenant_management_desc"),
        tenant: t(lang, "tenant_management_column_tenant"),
        status: t(lang, "tenant_management_column_status"),
        branches: t(lang, "tenant_management_column_branches"),
        activeSessions: t(lang, "tenant_management_column_active_sessions"),
        actions: t(lang, "tenant_management_column_actions"),
        active: t(lang, "tenant_management_status_active"),
        inactive: t(lang, "tenant_management_status_inactive"),
        manage: t(lang, "tenant_management_action_manage"),
        devices: t(lang, "tenant_management_action_devices"),
        sessions: t(lang, "tenant_management_action_sessions"),
        refresh: t(lang, "tenant_management_refresh"),
        loading: t(lang, "tenant_management_loading"),
        empty: t(lang, "tenant_management_empty"),
        fetchFailed: t(lang, "tenant_management_fetch_failed")
      }}
    />
  );
}
