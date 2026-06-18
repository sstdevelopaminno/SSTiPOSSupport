"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/i18n";
import { STANDARD_PACKAGE_PLANS, type StandardPackagePlan } from "@/lib/it-admin-package-standards";

type PackageContractTenant = {
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  tenant_active: boolean;
  contract_id: string;
  contract_no: string;
  contract_status: string;
  started_at: string | null;
  ended_at: string | null;
  branch_limit: number | null;
  device_limit: number | null;
  user_limit: number | null;
  branch_count: number;
  enabled_features: string[];
};

type TenantFeatureRow = {
  code: string;
  name: string;
  description: string;
  is_enabled: boolean;
  source: string;
  subscription_id: string | null;
  updated_at: string | null;
};

type ApiEnvelope<T> = {
  data: T;
  error: { code: string; message: string } | null;
};

type PackageContractsResponse = ApiEnvelope<{
  package: {
    id: string;
    code: string;
    name: string;
    monthly_price: number;
  } | null;
  summary: {
    active_contracts: number;
    total_contracts: number;
    active_tenants: number;
  };
  plan_features: string[];
  tenants: PackageContractTenant[];
}>;

type TenantFeaturesResponse = ApiEnvelope<{
  branch_id: string | null;
  features: TenantFeatureRow[];
}>;

type ContractPlanRow = {
  id: string;
  code: string;
  name: string;
  monthly_price: number;
  is_active: boolean;
};

type TenantContractResponse = ApiEnvelope<{
  plans: ContractPlanRow[];
  active_contract: {
    id: string;
    package_id: string;
  } | null;
}>;

type PackageChangeResponse = ApiEnvelope<{
  contract: {
    id: string;
    package_id: string;
  };
}>;

const REQUEST_TIMEOUT_MS = 15_000;

const uiText = {
  th: {
    statsTotal: "สัญญาทั้งหมด",
    statsActive: "กำลังใช้งาน",
    statsStores: "ร้าน active",
    statsFeatures: "ฟีเจอร์จากแพ็กเกจ",
    storesTitle: "ร้านค้าที่ขอเปิดใช้บริการ",
    storesDesc: "คลิกจัดการฟีเจอร์เพื่อเปิด/ปิดสิทธิ์ของร้านนั้น ค่า override นี้ถูกใช้ร่วมกับฝั่งระบบขายและหลังบ้านร้านค้า",
    searchPlaceholder: "ค้นหาเลขสัญญา / รหัสร้าน / ชื่อร้าน",
    searchLabel: "ค้นหาร้านค้าและสัญญา",
    refresh: "Refresh",
    loading: "Loading...",
    contractNo: "เลขที่สัญญา",
    storeCode: "รหัสร้านค้า",
    storeName: "ชื่อร้าน",
    status: "สถานะ",
    scope: "ขอบเขต",
    enabledFeatures: "ฟีเจอร์ที่ใช้งาน",
    actions: "จัดการ",
    startDate: "เริ่ม",
    branchUnit: "สาขา",
    deviceUnit: "เครื่อง",
    userUnit: "ผู้ใช้",
    tenantActive: "tenant active",
    tenantInactive: "tenant inactive",
    manageFeatures: "จัดการฟีเจอร์",
    viewFeatures: "ดูรายการ",
    viewFeaturesTitle: "ฟีเจอร์ที่ใช้งาน",
    viewFeaturesDialog: "หน้าต่างรายการฟีเจอร์ที่ใช้งาน",
    featureCount: (count: number) => `${count} รายการ`,
    summaryButton: "สรุป",
    summaryTitle: "สรุปแพ็กเกจ",
    summaryDialog: "หน้าต่างสรุปแพ็กเกจ",
    noStores: "ยังไม่มีร้านที่ผูกสัญญากับแพ็กเกจนี้",
    modalEyebrow: "Tenant feature gate",
    openTenant: "เปิดหน้าจัดการร้าน",
    save: "บันทึก",
    saving: "Saving...",
    close: "ปิด",
    closeDialog: "ปิดหน้าต่างจัดการฟีเจอร์",
    featureEnabled: "เปิดใช้",
    featureName: "รายการฟีเจอร์",
    featureSource: "ที่มา",
    lastUpdated: "อัปเดตล่าสุด",
    enabled: "เปิด",
    disabled: "ปิด",
    notAllowed: "บัญชีนี้ไม่มีสิทธิ์ feature_manage จึงไม่สามารถแก้ไขฟีเจอร์ของร้านค้าได้",
    featureLoading: "กำลังโหลด feature gate...",
    noFeatures: "ไม่พบรายการฟีเจอร์ใน catalog",
    saved: (name: string) => `บันทึกฟีเจอร์ของร้าน ${name} แล้ว`,
    contractsLoadFailed: "โหลดข้อมูลสัญญาแพ็กเกจไม่สำเร็จ",
    featuresLoadFailed: "โหลดรายการฟีเจอร์ของร้านไม่สำเร็จ",
    saveFailed: "บันทึกฟีเจอร์ไม่สำเร็จ",
    changePackage: "เปลี่ยนแพ็กเกจ",
    changePackageTitle: "เปลี่ยนแพ็กเกจร้านค้า",
    changePackageDialog: "หน้าต่างเปลี่ยนแพ็กเกจร้านค้า",
    packageSelect: "แพ็กเกจใหม่",
    packageChangeDesc: "การเปลี่ยนแพ็กเกจจะปรับสิทธิ์ฟีเจอร์ ราคา และโควตาที่ POS ใช้งานตามแพ็กเกจใหม่ทันที",
    savePackageChange: "บันทึกแพ็กเกจ",
    changingPackage: "กำลังเปลี่ยน...",
    contractLoading: "กำลังโหลดข้อมูลสัญญา...",
    packageChanged: (name: string, packageName: string) => `เปลี่ยนแพ็กเกจของร้าน ${name} เป็น ${packageName} แล้ว`,
    packageChangeFailed: "เปลี่ยนแพ็กเกจไม่สำเร็จ",
    requestTimeout: "ระบบตอบช้าเกินไป กรุณาลอง Refresh อีกครั้ง",
    statuses: {
      trial: "ทดลองใช้",
      active: "เปิดใช้งาน",
      suspended: "ระงับ",
      expired: "หมดอายุ",
      cancelled: "ยกเลิก"
    },
    sources: {
      plan: "ตามแพ็กเกจ",
      tenant_override: "ปรับโดย IT",
      branch_override: "ปรับเฉพาะสาขา",
      contract_inactive: "สัญญาไม่ active",
      none: "ยังไม่เปิด"
    }
  },
  en: {
    statsTotal: "Total contracts",
    statsActive: "Active contracts",
    statsStores: "Active stores",
    statsFeatures: "Package features",
    storesTitle: "Subscribed Stores",
    storesDesc: "Use feature management to enable or disable store entitlements. Overrides are enforced by POS and store back office APIs.",
    searchPlaceholder: "Search contract no. / store code / store name",
    searchLabel: "Search contracts",
    refresh: "Refresh",
    loading: "Loading...",
    contractNo: "Contract No.",
    storeCode: "Store Code",
    storeName: "Store Name",
    status: "Status",
    scope: "Scope",
    enabledFeatures: "Enabled Features",
    actions: "Actions",
    startDate: "Start",
    branchUnit: "branches",
    deviceUnit: "devices",
    userUnit: "users",
    tenantActive: "tenant active",
    tenantInactive: "tenant inactive",
    manageFeatures: "Manage Features",
    viewFeatures: "View List",
    viewFeaturesTitle: "Enabled Features",
    viewFeaturesDialog: "Enabled features dialog",
    featureCount: (count: number) => `${count} items`,
    summaryButton: "Summary",
    summaryTitle: "Package Summary",
    summaryDialog: "Package summary dialog",
    noStores: "No stores are contracted to this package yet.",
    modalEyebrow: "Tenant feature gate",
    openTenant: "Open store admin",
    save: "Save",
    saving: "Saving...",
    close: "Close",
    closeDialog: "Close feature management dialog",
    featureEnabled: "Enabled",
    featureName: "Feature",
    featureSource: "Source",
    lastUpdated: "Last Updated",
    enabled: "On",
    disabled: "Off",
    notAllowed: "This account does not have feature_manage permission, so store features cannot be edited.",
    featureLoading: "Loading feature gate...",
    noFeatures: "No feature catalog items found.",
    saved: (name: string) => `Saved features for ${name}.`,
    contractsLoadFailed: "Failed to load package contracts.",
    featuresLoadFailed: "Failed to load tenant features.",
    saveFailed: "Feature save failed.",
    changePackage: "Change Package",
    changePackageTitle: "Change Store Package",
    changePackageDialog: "Change store package dialog",
    packageSelect: "New package",
    packageChangeDesc: "Changing the package updates POS entitlements, price, and quota limits for this store immediately.",
    savePackageChange: "Save Package",
    changingPackage: "Changing...",
    contractLoading: "Loading contract details...",
    packageChanged: (name: string, packageName: string) => `Changed ${name} to ${packageName}.`,
    packageChangeFailed: "Package change failed.",
    requestTimeout: "The system is taking too long to respond. Please refresh and try again.",
    statuses: {
      trial: "Trial",
      active: "Active",
      suspended: "Suspended",
      expired: "Expired",
      cancelled: "Cancelled"
    },
    sources: {
      plan: "Package",
      tenant_override: "IT override",
      branch_override: "Branch override",
      contract_inactive: "Inactive contract",
      none: "Not enabled"
    }
  }
} as const;

const featureText: Record<string, { th: { name: string; description: string }; en: { name: string; description: string } }> = {
  "pos.sales.access": {
    th: { name: "ขายหน้าร้าน POS", description: "เปิดสิทธิ์หน้าขาย สร้างบิล รับชำระเงิน และดูรายการขาย" },
    en: { name: "POS Sales", description: "Allows sales screen access, order creation, payments, and sales operations." }
  },
  "pos.shift.open": {
    th: { name: "เปิดกะขาย", description: "เปิดกะพนักงานและเริ่มใช้งานเครื่องขายประจำสาขา" },
    en: { name: "Open Shift", description: "Allows staff to open a POS shift and start selling from a branch device." }
  },
  core_pos_sales: {
    th: { name: "ขายหน้าร้าน POS", description: "เปิดสิทธิ์หน้าขาย ออเดอร์ สินค้า และรับชำระเงินใน POS" },
    en: { name: "Core POS Sales", description: "Allows POS sales, order, product lookup, and payment APIs." }
  },
  pin_login: {
    th: { name: "เข้าสู่ระบบด้วย PIN", description: "ให้พนักงานยืนยันตัวตนด้วยรหัส PIN ก่อนเข้าใช้งาน POS" },
    en: { name: "PIN Login", description: "Allows staff to verify access with a PIN before entering POS." }
  },
  qr_login: {
    th: { name: "เข้าสู่ระบบด้วย QR", description: "ให้พนักงานสแกน QR เพื่อยืนยันตัวตนก่อนเข้าใช้งาน POS" },
    en: { name: "QR Login", description: "Allows staff QR verification before entering POS." }
  },
  staff_card_login: {
    th: { name: "บัตรพนักงาน / ชื่อพนักงาน", description: "เปิดการยืนยันตัวตนด้วยบัตรพนักงานหรือชื่อพนักงาน" },
    en: { name: "Staff Card Login", description: "Allows staff card or employee-name verification." }
  },
  attendance_tracking: {
    th: { name: "ลงเวลาเข้า-ออกงาน", description: "เปิดเช็กอิน เช็กเอาต์ และสถานะเวลาทำงานของพนักงาน" },
    en: { name: "Attendance Tracking", description: "Allows staff check-in, check-out, and attendance status." }
  },
  user_management: {
    th: { name: "จัดการผู้ใช้และบทบาท", description: "เปิดการเพิ่มผู้ใช้ กำหนดบทบาท และสิทธิ์ในร้าน" },
    en: { name: "User Management", description: "Allows user creation, role assignment, and store permissions." }
  },
  device_management: {
    th: { name: "จัดการเครื่อง POS", description: "เปิดการลงทะเบียน อนุมัติ และควบคุมเครื่อง POS ของร้าน" },
    en: { name: "Device Management", description: "Allows POS device registration, approval, and controls." }
  },
  branch_management: {
    th: { name: "จัดการสาขา", description: "เปิดการเพิ่มและจัดการสาขาของร้านตามโควตาแพ็กเกจ" },
    en: { name: "Branch Management", description: "Allows branch provisioning and management within package limits." }
  },
  table_management: {
    th: { name: "จัดการโต๊ะ Dine-in", description: "เปิดผังโต๊ะ โซน โต๊ะว่าง/ใช้งาน และงานย้ายโต๊ะ" },
    en: { name: "Dine-in Table Management", description: "Allows floor/table zones, table status, and table operations." }
  },
  qr_table_ordering: {
    th: { name: "สั่งอาหารผ่าน QR โต๊ะ", description: "ให้ลูกค้าสแกน QR ที่โต๊ะเพื่อส่งรายการเข้าระบบ" },
    en: { name: "QR Table Ordering", description: "Lets customers scan a table QR code and send orders to POS." }
  },
  customer_facing_display: {
    th: { name: "จอลูกค้า", description: "เปิดจอแสดงรายการและยอดรวมให้ลูกค้าเห็นระหว่างคิดเงิน" },
    en: { name: "Customer Display", description: "Shows order items and totals on a customer-facing screen." }
  },
  transfer_slip_verification: {
    th: { name: "ตรวจสลิปโอนเงิน", description: "เปิดการตรวจหลักฐานโอนเงินก่อนปิดบิล" },
    en: { name: "Transfer Slip Verification", description: "Allows bank-transfer slip checks before closing bills." }
  },
  staff_qr_clockin: {
    th: { name: "ลงเวลาด้วย QR พนักงาน", description: "ให้พนักงานสแกน QR เพื่อลงเวลาเข้าออกงาน" },
    en: { name: "Staff QR Clock-in", description: "Allows staff QR clock-in and clock-out workflows." }
  },
  advanced_sales_reports: {
    th: { name: "รายงานขายขั้นสูง", description: "เปิดรายงานยอดขายเชิงลึกและมุมมองหลายสาขา" },
    en: { name: "Advanced Sales Reports", description: "Enables deeper sales reports and multi-branch views." }
  },
  receipt_reprint_history: {
    th: { name: "ประวัติพิมพ์ใบเสร็จ", description: "เปิดค้นหาและพิมพ์ใบเสร็จย้อนหลังพร้อมบันทึกตรวจสอบ" },
    en: { name: "Receipt Reprint History", description: "Allows receipt history lookup and reprint audit trails." }
  },
  multi_terminal_sync: {
    th: { name: "ซิงก์หลายเครื่อง POS", description: "ให้หลายเครื่องในสาขาเดียวกันใช้งานร่วมกันได้" },
    en: { name: "Multi Terminal Sync", description: "Allows multiple POS terminals to work together in a branch." }
  },
  offline_queue_resilience: {
    th: { name: "คิวออฟไลน์ / Retry", description: "ช่วยเก็บคิวและส่งข้อมูลใหม่เมื่อเน็ตกลับมา" },
    en: { name: "Offline Queue Resilience", description: "Queues work offline and retries when connectivity returns." }
  },
  desktop_app_runtime: {
    th: { name: "โปรแกรมเดสก์ท็อป", description: "เปิดโหมดใช้งานผ่านโปรแกรมเดสก์ท็อปแบบ online/offline" },
    en: { name: "Desktop App Runtime", description: "Allows desktop runtime use in online/offline modes." }
  },
  barcode_scanner_mode: {
    th: { name: "ยิงบาร์โค้ดขายสินค้า", description: "เปิดโหมดขายเร็วด้วยเครื่องสแกนบาร์โค้ด" },
    en: { name: "Barcode Scanner Mode", description: "Enables fast checkout with barcode scanners." }
  },
  kitchen_printing: {
    th: { name: "พิมพ์บิลครัว", description: "ส่งรายการอาหารไปยังครัวหรือ station เครื่องพิมพ์" },
    en: { name: "Kitchen Printing", description: "Sends kitchen tickets to printer stations." }
  },
  mobile_qr_login: {
    th: { name: "QR Login ผ่านมือถือ", description: "เปิด workflow เข้าระบบด้วย QR จากมือถือที่ลงทะเบียน" },
    en: { name: "Mobile QR Login", description: "Allows mobile-based QR login with enrollment controls." }
  },
  mobile_device_enrollment: {
    th: { name: "ลงทะเบียนอุปกรณ์มือถือ", description: "เปิดการสร้าง token และอนุมัติมือถือสำหรับร้าน" },
    en: { name: "Mobile Device Enrollment", description: "Allows mobile activation tokens and device enrollment." }
  },
  mobile_slip_scan: {
    th: { name: "สแกนสลิปผ่านมือถือ", description: "เปิดใช้กล้องมือถือเพื่อสแกนหรือตรวจสลิปโอนเงิน" },
    en: { name: "Mobile Slip Scan", description: "Allows mobile camera slip scanning workflows." }
  }
};

function normalizeFeatureLookup(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function getFeatureDisplay(feature: Pick<TenantFeatureRow, "code" | "name" | "description">, language: Language) {
  const direct = featureText[feature.code] ?? featureText[normalizeFeatureLookup(feature.name)];
  if (direct) return direct[language];
  return {
    name: feature.name || feature.code,
    description: feature.description || feature.code
  };
}

function getFeatureListDisplay(raw: string, language: Language) {
  const direct = featureText[raw] ?? featureText[normalizeFeatureLookup(raw)];
  if (direct) return direct[language];
  return {
    name: raw,
    description: raw
  };
}

function formatDate(value: string | null, language: Language): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", { dateStyle: "medium" }).format(new Date(value));
}

function contractStatusLabel(status: string, language: Language): string {
  const text = uiText[language];
  return text.statuses[status as keyof typeof text.statuses] ?? status;
}

function featureSourceLabel(source: string, language: Language): string {
  const text = uiText[language];
  return text.sources[source as keyof typeof text.sources] ?? source;
}

async function readApiJson<T>(url: string, init: RequestInit | undefined, timeoutMessage: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    const payload = (await response.json()) as T;
    if (!response.ok) {
      const errorMessage =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error &&
        typeof payload.error === "object" &&
        "message" in payload.error
          ? String(payload.error.message)
          : "Request failed.";
      throw new Error(errorMessage);
    }
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function PackageContractsConsole({
  plan,
  canManageFeatures,
  language
}: {
  plan: StandardPackagePlan;
  canManageFeatures: boolean;
  language: Language;
}) {
  const text = uiText[language];
  const [items, setItems] = useState<PackageContractTenant[]>([]);
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [summary, setSummary] = useState({ active_contracts: 0, total_contracts: 0, active_tenants: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [featureListTenantId, setFeatureListTenantId] = useState<string | null>(null);
  const [featureRows, setFeatureRows] = useState<TenantFeatureRow[]>([]);
  const [featureDraft, setFeatureDraft] = useState<Record<string, boolean>>({});
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [featureError, setFeatureError] = useState<string | null>(null);
  const [packageChangeTenantId, setPackageChangeTenantId] = useState<string | null>(null);
  const [packagePlans, setPackagePlans] = useState<ContractPlanRow[]>([]);
  const [packageDraftId, setPackageDraftId] = useState("");
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageError, setPackageError] = useState<string | null>(null);

  const selectedTenant = useMemo(
    () => items.find((item) => item.tenant_id === selectedTenantId) ?? null,
    [items, selectedTenantId]
  );

  const featureListTenant = useMemo(
    () => items.find((item) => item.tenant_id === featureListTenantId) ?? null,
    [featureListTenantId, items]
  );

  const packageChangeTenant = useMemo(
    () => items.find((item) => item.tenant_id === packageChangeTenantId) ?? null,
    [items, packageChangeTenantId]
  );

  const packageOptionByCode = useMemo(() => new Map(STANDARD_PACKAGE_PLANS.map((packagePlan) => [packagePlan.code, packagePlan])), []);

  const changedFeatureRows = useMemo(() => {
    return featureRows.filter((feature) => featureDraft[feature.code] !== feature.is_enabled);
  }, [featureDraft, featureRows]);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await readApiJson<PackageContractsResponse>(
        `/api/it-admin/packages/${plan.code}/contracts`,
        { cache: "no-store" },
        text.requestTimeout
      );
      if (payload.error) {
        throw new Error(payload.error?.message ?? text.contractsLoadFailed);
      }
      setItems(payload.data.tenants ?? []);
      setPlanFeatures(payload.data.plan_features ?? []);
      setSummary(payload.data.summary ?? { active_contracts: 0, total_contracts: 0, active_tenants: 0 });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.contractsLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [plan.code, text.contractsLoadFailed, text.requestTimeout]);

  const loadTenantFeatures = useCallback(
    async (tenantId: string) => {
      setFeatureLoading(true);
      setFeatureError(null);
      setSuccess(null);
      try {
        const payload = await readApiJson<TenantFeaturesResponse>(
          `/api/it-admin/admin/tenants/${tenantId}/features`,
          { cache: "no-store" },
          text.requestTimeout
        );
        if (payload.error) {
          throw new Error(payload.error?.message ?? text.featuresLoadFailed);
        }
        const nextFeatures = payload.data.features ?? [];
        setFeatureRows(nextFeatures);
        setFeatureDraft(Object.fromEntries(nextFeatures.map((feature) => [feature.code, feature.is_enabled])));
      } catch (loadError) {
        setFeatureRows([]);
        setFeatureDraft({});
        setFeatureError(loadError instanceof Error ? loadError.message : text.featuresLoadFailed);
      } finally {
        setFeatureLoading(false);
      }
    },
    [text.featuresLoadFailed, text.requestTimeout]
  );

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  useEffect(() => {
    if (!selectedTenantId || !canManageFeatures) {
      setFeatureRows([]);
      setFeatureDraft({});
      setFeatureError(null);
      return;
    }
    void loadTenantFeatures(selectedTenantId);
  }, [canManageFeatures, loadTenantFeatures, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenant && !featureListTenant && !summaryOpen && !packageChangeTenant) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSummaryOpen(false);
        setSelectedTenantId(null);
        setFeatureListTenantId(null);
        setPackageChangeTenantId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [featureListTenant, packageChangeTenant, selectedTenant, summaryOpen]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => {
      return [item.contract_no, item.tenant_code, item.tenant_name, item.contract_status]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query]);

  function openSummary() {
    setSummaryOpen(true);
    setSelectedTenantId(null);
    setFeatureListTenantId(null);
    setPackageChangeTenantId(null);
  }

  function openFeatureList(item: PackageContractTenant) {
    setFeatureListTenantId(item.tenant_id);
    setSummaryOpen(false);
    setSelectedTenantId(null);
    setPackageChangeTenantId(null);
  }

  function selectTenant(item: PackageContractTenant) {
    setSelectedTenantId(item.tenant_id);
    setSummaryOpen(false);
    setFeatureListTenantId(null);
    setPackageChangeTenantId(null);
    setFeatureError(null);
    setSuccess(null);
  }

  async function openPackageChange(item: PackageContractTenant) {
    setPackageChangeTenantId(item.tenant_id);
    setSummaryOpen(false);
    setSelectedTenantId(null);
    setFeatureListTenantId(null);
    setPackageError(null);
    setSuccess(null);
    setPackageLoading(true);
    try {
      const payload = await readApiJson<TenantContractResponse>(
        `/api/it-admin/admin/tenants/${item.tenant_id}/contract`,
        { cache: "no-store" },
        text.requestTimeout
      );
      if (payload.error) {
        throw new Error(payload.error.message);
      }
      const activePlans = (payload.data.plans ?? []).filter((packagePlan) => packagePlan.is_active);
      setPackagePlans(activePlans);
      setPackageDraftId(payload.data.active_contract?.package_id ?? activePlans[0]?.id ?? "");
    } catch (loadError) {
      setPackagePlans([]);
      setPackageDraftId("");
      setPackageError(loadError instanceof Error ? loadError.message : text.packageChangeFailed);
    } finally {
      setPackageLoading(false);
    }
  }

  async function saveTenantFeatures() {
    if (!selectedTenant || changedFeatureRows.length === 0) return;
    setFeatureSaving(true);
    setFeatureError(null);
    setSuccess(null);
    try {
      const payload = await readApiJson<ApiEnvelope<{ features: unknown[] }>>(
        `/api/it-admin/admin/tenants/${selectedTenant.tenant_id}/features`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch_id: null,
            features: changedFeatureRows.map((feature) => ({
              feature_code: feature.code,
              is_enabled: featureDraft[feature.code]
            }))
          })
        },
        text.requestTimeout
      );
      if (payload.error) {
        throw new Error(payload.error?.message ?? text.saveFailed);
      }

      setSuccess(text.saved(selectedTenant.tenant_name));
      await loadTenantFeatures(selectedTenant.tenant_id);
      await loadContracts();
    } catch (saveError) {
      setFeatureError(saveError instanceof Error ? saveError.message : text.saveFailed);
    } finally {
      setFeatureSaving(false);
    }
  }

  async function savePackageChange() {
    if (!packageChangeTenant || !packageDraftId || packageSaving) return;
    setPackageSaving(true);
    setPackageError(null);
    setSuccess(null);
    try {
      const payload = await readApiJson<PackageChangeResponse>(
        `/api/it-admin/admin/tenants/${packageChangeTenant.tenant_id}/contract`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: packageDraftId })
        },
        text.requestTimeout
      );
      if (payload.error) {
        throw new Error(payload.error.message);
      }

      const nextPlan = packagePlans.find((packagePlan) => packagePlan.id === packageDraftId);
      setSuccess(text.packageChanged(packageChangeTenant.tenant_name, nextPlan?.name ?? text.changePackage));
      setPackageChangeTenantId(null);
      await loadContracts();
    } catch (saveError) {
      setPackageError(saveError instanceof Error ? saveError.message : text.packageChangeFailed);
    } finally {
      setPackageSaving(false);
    }
  }

  return (
    <div className="package-detail-console">
      <section className="package-detail-panel">
        <div className="package-detail-panel__head">
          <div>
            <h3>{text.storesTitle}</h3>
            <p>{text.storesDesc}</p>
          </div>
          <div className="package-detail-panel__actions">
            <button type="button" className="package-summary-btn" onClick={openSummary}>
              {text.summaryButton}
            </button>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
              aria-label={text.searchLabel}
            />
            <button type="button" className="pos-monitor-btn pos-monitor-btn--primary" onClick={() => void loadContracts()} disabled={loading}>
              {loading ? text.loading : text.refresh}
            </button>
          </div>
        </div>

        {success ? <p className="package-detail-success">{success}</p> : null}
        {error ? <p className="package-detail-error">{error}</p> : null}

        <div className="package-contract-table-wrap">
          <table className="package-contract-table">
            <thead>
              <tr>
                <th>{text.contractNo}</th>
                <th>{text.storeCode}</th>
                <th>{text.storeName}</th>
                <th>{text.status}</th>
                <th>{text.scope}</th>
                <th>{text.enabledFeatures}</th>
                <th>{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.contract_id} className={item.tenant_id === selectedTenantId ? "is-selected" : undefined}>
                  <td>
                    <strong>{item.contract_no}</strong>
                    <small>
                      {item.contract_id.slice(0, 8)} | {text.startDate} {formatDate(item.started_at, language)}
                    </small>
                  </td>
                  <td>{item.tenant_code}</td>
                  <td>
                    <Link href={`/tenants/${item.tenant_id}`}>{item.tenant_name}</Link>
                    <small>{item.tenant_active ? text.tenantActive : text.tenantInactive}</small>
                  </td>
                  <td>
                    <span className={`package-status package-status--${item.contract_status}`}>
                      {contractStatusLabel(item.contract_status, language)}
                    </span>
                  </td>
                  <td>
                    <span>
                      {item.branch_count}/{item.branch_limit ?? "-"} {text.branchUnit}
                    </span>
                    <small>
                      {item.device_limit ?? "-"} {text.deviceUnit}, {item.user_limit ?? "-"} {text.userUnit}
                    </small>
                  </td>
                  <td>
                    <button type="button" className="package-feature-view-btn" onClick={() => openFeatureList(item)}>
                      {text.viewFeatures}
                    </button>
                    <small className="package-feature-count">{text.featureCount(item.enabled_features.length)}</small>
                  </td>
                  <td>
                    <div className="package-row-actions">
                      <button type="button" className="package-feature-edit-btn" onClick={() => selectTenant(item)}>
                        {text.manageFeatures}
                      </button>
                      <button type="button" className="package-feature-edit-btn package-feature-edit-btn--muted" onClick={() => void openPackageChange(item)}>
                        {text.changePackage}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="package-contract-table__empty">
                    {text.noStores}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {summaryOpen ? (
        <div className="package-feature-modal-backdrop" role="presentation" onMouseDown={() => setSummaryOpen(false)}>
          <section
            className="package-tenant-feature-panel package-summary-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-summary-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="package-tenant-feature-panel__head">
              <div>
                <p className="package-console__eyebrow">{plan.name}</p>
                <h3 id="package-summary-modal-title">{text.summaryTitle}</h3>
              </div>
              <div className="package-tenant-feature-panel__actions">
                <button
                  type="button"
                  className="package-feature-modal-close"
                  aria-label={text.summaryDialog}
                  onClick={() => setSummaryOpen(false)}
                >
                  {text.close}
                </button>
              </div>
            </div>
            <div className="package-summary-grid">
              <div>
                <span>{text.statsTotal}</span>
                <strong>{summary.total_contracts}</strong>
              </div>
              <div>
                <span>{text.statsActive}</span>
                <strong>{summary.active_contracts}</strong>
              </div>
              <div>
                <span>{text.statsStores}</span>
                <strong>{summary.active_tenants}</strong>
              </div>
              <div>
                <span>{text.statsFeatures}</span>
                <strong>{planFeatures.length}</strong>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {featureListTenant ? (
        <div className="package-feature-modal-backdrop" role="presentation" onMouseDown={() => setFeatureListTenantId(null)}>
          <section
            className="package-tenant-feature-panel package-enabled-feature-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-enabled-feature-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="package-tenant-feature-panel__head">
              <div>
                <p className="package-console__eyebrow">{text.enabledFeatures}</p>
                <h3 id="package-enabled-feature-modal-title">{featureListTenant.tenant_name}</h3>
                <p>
                  {featureListTenant.tenant_code} | {text.featureCount(featureListTenant.enabled_features.length)}
                </p>
              </div>
              <div className="package-tenant-feature-panel__actions">
                <button
                  type="button"
                  className="package-feature-modal-close"
                  aria-label={text.viewFeaturesDialog}
                  onClick={() => setFeatureListTenantId(null)}
                >
                  {text.close}
                </button>
              </div>
            </div>
            <div className="package-enabled-feature-list">
              {featureListTenant.enabled_features.map((feature) => {
                const display = getFeatureListDisplay(feature, language);
                return (
                  <article key={`${featureListTenant.contract_id}-${feature}`} className="package-enabled-feature-item">
                    <strong>{display.name}</strong>
                    <small>{display.description}</small>
                  </article>
                );
              })}
              {featureListTenant.enabled_features.length === 0 ? (
                <p className="package-contract-table__empty">{text.noFeatures}</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {packageChangeTenant ? (
        <div className="package-feature-modal-backdrop" role="presentation" onMouseDown={() => setPackageChangeTenantId(null)}>
          <section
            className="package-tenant-feature-panel package-package-change-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-change-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="package-tenant-feature-panel__head">
              <div>
                <p className="package-console__eyebrow">{text.changePackage}</p>
                <h3 id="package-change-modal-title">{text.changePackageTitle}</h3>
                <p>
                  {packageChangeTenant.tenant_code} | {packageChangeTenant.tenant_name}
                </p>
              </div>
              <div className="package-tenant-feature-panel__actions">
                <button
                  type="button"
                  className="package-feature-modal-close"
                  aria-label={text.changePackageDialog}
                  onClick={() => setPackageChangeTenantId(null)}
                >
                  {text.close}
                </button>
              </div>
            </div>

            <p className="package-package-change-modal__desc">{text.packageChangeDesc}</p>
            {packageError ? <p className="package-detail-error">{packageError}</p> : null}
            {packageLoading ? <p className="package-tenant-feature-panel__loading">{text.contractLoading}</p> : null}

            {!packageLoading ? (
              <label className="package-package-change-modal__field">
                <span>{text.packageSelect}</span>
                <select value={packageDraftId} onChange={(event) => setPackageDraftId(event.target.value)} disabled={packageSaving}>
                  {packagePlans.map((packagePlan) => {
                    const standardPlan = packageOptionByCode.get(packagePlan.code as StandardPackagePlan["code"]);
                    const priceLabel = standardPlan?.priceLabel ?? `${Number(packagePlan.monthly_price).toLocaleString()} THB/month`;
                    return (
                      <option key={packagePlan.id} value={packagePlan.id}>
                        {packagePlan.name} - {priceLabel}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : null}

            <div className="package-package-change-modal__actions">
              <button
                type="button"
                className="pos-monitor-btn pos-monitor-btn--primary"
                onClick={() => void savePackageChange()}
                disabled={packageLoading || packageSaving || !packageDraftId}
              >
                {packageSaving ? text.changingPackage : text.savePackageChange}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedTenant ? (
        <div className="package-feature-modal-backdrop" role="presentation" onMouseDown={() => setSelectedTenantId(null)}>
          <section
            className="package-tenant-feature-panel package-tenant-feature-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-feature-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="package-tenant-feature-panel__head">
              <div>
                <p className="package-console__eyebrow">{text.modalEyebrow}</p>
                <h3 id="package-feature-modal-title">{selectedTenant.tenant_name}</h3>
                <p>
                  {selectedTenant.tenant_code} | {selectedTenant.contract_no} |{" "}
                  {contractStatusLabel(selectedTenant.contract_status, language)}
                </p>
              </div>
              <div className="package-tenant-feature-panel__actions">
                <Link href={`/tenants/${selectedTenant.tenant_id}/features`}>{text.openTenant}</Link>
                <button
                  type="button"
                  className="pos-monitor-btn pos-monitor-btn--primary"
                  onClick={() => void saveTenantFeatures()}
                  disabled={!canManageFeatures || featureSaving || changedFeatureRows.length === 0}
                >
                  {featureSaving ? text.saving : `${text.save} (${changedFeatureRows.length})`}
                </button>
                <button
                  type="button"
                  className="package-feature-modal-close"
                  aria-label={text.closeDialog}
                  onClick={() => setSelectedTenantId(null)}
                >
                  {text.close}
                </button>
              </div>
            </div>

            {!canManageFeatures ? <p className="package-detail-error">{text.notAllowed}</p> : null}
            {featureError ? <p className="package-detail-error">{featureError}</p> : null}
            {featureLoading ? <p className="package-tenant-feature-panel__loading">{text.featureLoading}</p> : null}

            {canManageFeatures && !featureLoading ? (
              <div className="package-tenant-feature-table-wrap">
                <table className="package-tenant-feature-table">
                  <thead>
                    <tr>
                      <th>{text.featureEnabled}</th>
                      <th>{text.featureName}</th>
                      <th>{text.featureSource}</th>
                      <th>{text.lastUpdated}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureRows.map((feature) => {
                      const checked = Boolean(featureDraft[feature.code]);
                      const changed = checked !== feature.is_enabled;
                      const display = getFeatureDisplay(feature, language);
                      return (
                        <tr key={feature.code} className={changed ? "is-changed" : undefined}>
                          <td>
                            <label className="package-feature-toggle">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => setFeatureDraft((current) => ({ ...current, [feature.code]: event.target.checked }))}
                                disabled={featureSaving}
                              />
                              <span>{checked ? text.enabled : text.disabled}</span>
                            </label>
                          </td>
                          <td>
                            <strong>{display.name}</strong>
                            <small>{feature.code}</small>
                            <p>{display.description}</p>
                          </td>
                          <td>
                            <span className={`package-feature-source package-feature-source--${feature.source}`}>
                              {featureSourceLabel(feature.source, language)}
                            </span>
                          </td>
                          <td>{formatDate(feature.updated_at, language)}</td>
                        </tr>
                      );
                    })}
                    {featureRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="package-contract-table__empty">
                          {text.noFeatures}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
