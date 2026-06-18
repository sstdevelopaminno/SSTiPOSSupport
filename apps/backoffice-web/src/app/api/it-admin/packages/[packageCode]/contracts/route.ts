import { ok } from "@/lib/http";
import { guardItAdminError, requireItAdmin } from "@/lib/it-admin-guard";

type PackageRow = {
  id: string;
  code: string;
  name: string;
  monthly_price: number;
};

type ContractRow = {
  id: string;
  tenant_id: string;
  package_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  branch_limit: number | null;
  terminal_limit_per_branch: number | null;
  max_branches: number | null;
  max_devices: number | null;
  max_users: number | null;
  created_at: string;
};

type TenantRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type BranchRow = {
  tenant_id: string;
  id: string;
};

type PackageFeatureRow = {
  feature_code: string;
  included: boolean | null;
};

type FeatureCatalogRow = {
  code: string;
  name: string;
};

type TenantFeatureOverrideRow = {
  tenant_id: string;
  feature_code: string;
  is_enabled: boolean;
  branch_id: string | null;
};

function buildContractNo(tenantCode: string, contract: ContractRow): string {
  const year = contract.created_at ? new Date(contract.created_at).getFullYear() : new Date().getFullYear();
  return `SST-${tenantCode}-${year}-${contract.id.slice(0, 8).toUpperCase()}`;
}

export async function GET(_req: Request, context: { params: Promise<{ packageCode: string }> }) {
  try {
    const { supabase } = await requireItAdmin({ permission: "package_read" });
    const { packageCode: rawPackageCode } = await context.params;
    const packageCode = decodeURIComponent(rawPackageCode).trim();

    const { data: packageRow, error: packageError } = await supabase
      .from("subscription_packages")
      .select("id,code,name,monthly_price")
      .eq("code", packageCode)
      .maybeSingle<PackageRow>();

    if (packageError) {
      throw new Error(packageError.message);
    }

    if (!packageRow) {
      return ok({
        package: null,
        summary: {
          active_contracts: 0,
          total_contracts: 0,
          active_tenants: 0
        },
        plan_features: [],
        tenants: []
      });
    }

    const [{ data: contractRows, error: contractError }, { data: packageFeatureRows, error: packageFeatureError }] = await Promise.all([
      supabase
        .from("tenant_subscription_contracts")
        .select("id,tenant_id,package_id,status,started_at,ended_at,branch_limit,terminal_limit_per_branch,max_branches,max_devices,max_users,created_at")
        .eq("package_id", packageRow.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscription_package_features")
        .select("feature_code,included")
        .eq("package_id", packageRow.id)
        .eq("included", true)
    ]);

    if (contractError) {
      throw new Error(contractError.message);
    }
    if (packageFeatureError) {
      throw new Error(packageFeatureError.message);
    }

    const latestByTenant = new Map<string, ContractRow>();
    for (const contract of (contractRows ?? []) as ContractRow[]) {
      if (!latestByTenant.has(contract.tenant_id)) {
        latestByTenant.set(contract.tenant_id, contract);
      }
    }

    const latestContracts = Array.from(latestByTenant.values());
    const tenantIds = latestContracts.map((contract) => contract.tenant_id);
    const planFeatureCodes = ((packageFeatureRows ?? []) as PackageFeatureRow[]).map((feature) => feature.feature_code);

    const [
      { data: tenantRows, error: tenantError },
      { data: branchRows, error: branchError },
      { data: featureCatalogRows, error: featureCatalogError },
      { data: tenantOverrideRows, error: tenantOverrideError }
    ] = await Promise.all([
      tenantIds.length > 0
        ? supabase.from("tenants").select("id,code,name,is_active").in("id", tenantIds)
        : Promise.resolve({ data: [], error: null }),
      tenantIds.length > 0
        ? supabase.from("branches").select("tenant_id,id").in("tenant_id", tenantIds)
        : Promise.resolve({ data: [], error: null }),
      planFeatureCodes.length > 0
        ? supabase.from("package_feature_catalog").select("code,name").in("code", planFeatureCodes)
        : Promise.resolve({ data: [], error: null }),
      tenantIds.length > 0
        ? supabase
            .from("tenant_feature_subscriptions")
            .select("tenant_id,feature_code,is_enabled,branch_id")
            .in("tenant_id", tenantIds)
            .is("branch_id", null)
        : Promise.resolve({ data: [], error: null })
    ]);

    if (tenantError) throw new Error(tenantError.message);
    if (branchError) throw new Error(branchError.message);
    if (featureCatalogError) throw new Error(featureCatalogError.message);
    if (tenantOverrideError) throw new Error(tenantOverrideError.message);

    const tenantById = new Map(((tenantRows ?? []) as TenantRow[]).map((tenant) => [tenant.id, tenant]));
    const featureNameByCode = new Map(((featureCatalogRows ?? []) as FeatureCatalogRow[]).map((feature) => [feature.code, feature.name]));
    const branchCountByTenant = new Map<string, number>();
    const overridesByTenant = new Map<string, TenantFeatureOverrideRow[]>();

    for (const branch of (branchRows ?? []) as BranchRow[]) {
      branchCountByTenant.set(branch.tenant_id, (branchCountByTenant.get(branch.tenant_id) ?? 0) + 1);
    }

    for (const override of (tenantOverrideRows ?? []) as TenantFeatureOverrideRow[]) {
      const current = overridesByTenant.get(override.tenant_id) ?? [];
      current.push(override);
      overridesByTenant.set(override.tenant_id, current);
    }

    const tenants = latestContracts
      .map((contract) => {
        const tenant = tenantById.get(contract.tenant_id);
        if (!tenant) return null;
        const effectiveFeatureCodes = new Set(planFeatureCodes);
        for (const override of overridesByTenant.get(contract.tenant_id) ?? []) {
          if (override.is_enabled) {
            effectiveFeatureCodes.add(override.feature_code);
          } else {
            effectiveFeatureCodes.delete(override.feature_code);
          }
        }

        return {
          tenant_id: tenant.id,
          tenant_code: tenant.code,
          tenant_name: tenant.name,
          tenant_active: tenant.is_active,
          contract_id: contract.id,
          contract_no: buildContractNo(tenant.code, contract),
          contract_status: contract.status,
          started_at: contract.started_at,
          ended_at: contract.ended_at,
          branch_limit: contract.max_branches ?? contract.branch_limit,
          device_limit: contract.max_devices ?? contract.terminal_limit_per_branch,
          user_limit: contract.max_users,
          branch_count: branchCountByTenant.get(tenant.id) ?? 0,
          enabled_features: Array.from(effectiveFeatureCodes).map((code) => featureNameByCode.get(code) ?? code)
        };
      })
      .filter((tenant): tenant is NonNullable<typeof tenant> => Boolean(tenant));

    return ok({
      package: packageRow,
      summary: {
        active_contracts: tenants.filter((tenant) => tenant.contract_status === "active" || tenant.contract_status === "trial").length,
        total_contracts: tenants.length,
        active_tenants: tenants.filter((tenant) => tenant.tenant_active).length
      },
      plan_features: planFeatureCodes.map((code) => featureNameByCode.get(code) ?? code),
      tenants
    });
  } catch (error) {
    return guardItAdminError(error);
  }
}
