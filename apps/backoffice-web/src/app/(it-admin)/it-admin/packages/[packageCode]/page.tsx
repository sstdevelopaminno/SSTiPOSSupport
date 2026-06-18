import { notFound } from "next/navigation";
import { PackageContractsConsole } from "@/components/it-admin/package-contracts-console";
import { getAuthContext } from "@/lib/auth-context";
import { getCurrentLanguage } from "@/lib/i18n";
import { getStandardPackageByCode } from "@/lib/it-admin-package-standards";
import { hasItAdminPermission } from "@/lib/it-admin-guard";

type PackageDetailPageProps = {
  params: Promise<{ packageCode: string }>;
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const auth = await getAuthContext({ requireBranchScope: false }).catch(() => null);
  if (!auth || !hasItAdminPermission(auth.platformRole, "package_read")) {
    return (
      <section className="surface">
        <h2>Forbidden</h2>
        <p>IT admin or IT support permission is required.</p>
      </section>
    );
  }

  const { packageCode } = await params;
  const plan = getStandardPackageByCode(decodeURIComponent(packageCode));
  if (!plan) {
    notFound();
  }

  const language = await getCurrentLanguage();

  return (
    <PackageContractsConsole
      plan={plan}
      canManageFeatures={hasItAdminPermission(auth.platformRole, "feature_manage")}
      language={language}
    />
  );
}
