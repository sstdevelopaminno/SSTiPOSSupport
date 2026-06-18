export type StandardPackageCode = "launch_lite" | "starter" | "standard" | "pro" | "business";

export type PackageFeatureValue = boolean | string;

export type PackageFeatureRow = {
  id: string;
  label: string;
  values: Record<StandardPackageCode, PackageFeatureValue>;
};

export type StandardPackagePlan = {
  code: StandardPackageCode;
  name: string;
  monthlyPrice: number;
  priceLabel: string;
  badge?: string;
  note: string;
  userLimit: string;
  deviceLimit: string;
  productLimit: string;
};

export const STANDARD_PACKAGE_PLANS: StandardPackagePlan[] = [
  {
    code: "launch_lite",
    name: "Launch Lite",
    monthlyPrice: 199,
    priceLabel: "199 บ./เดือน",
    badge: "โปรเปิดตัว 3 เดือนแรก",
    note: "หลังครบโปรต่ออายุเป็น Starter 399 บ./เดือน",
    userLimit: "1-2",
    deviceLimit: "1",
    productLimit: "100"
  },
  {
    code: "starter",
    name: "Starter",
    monthlyPrice: 399,
    priceLabel: "399 บ./เดือน",
    note: "รายปี 3,588 บาท เฉลี่ย 299 บ./เดือน เหมาะสำหรับร้านเล็กเริ่มต้น",
    userLimit: "2",
    deviceLimit: "1",
    productLimit: "200"
  },
  {
    code: "standard",
    name: "Standard",
    monthlyPrice: 699,
    priceLabel: "699 บ./เดือน",
    badge: "แนะนำ",
    note: "เหมาะกับร้านที่ต้องการโต๊ะ QR, export และสิทธิ์ทีมครบขึ้น",
    userLimit: "5",
    deviceLimit: "2",
    productLimit: "500"
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPrice: 1099,
    priceLabel: "1,099 บ./เดือน",
    note: "สำหรับร้านที่ต้องใช้ QR โต๊ะ จอครัว สต๊อกสูตร และงานบริการจริงจัง",
    userLimit: "10",
    deviceLimit: "3-5",
    productLimit: "1,500"
  },
  {
    code: "business",
    name: "Business",
    monthlyPrice: 1990,
    priceLabel: "เริ่ม 1,990 บ./เดือน",
    note: "สำหรับหลายสาขา dashboard รวม และข้อตกลงตามการใช้งาน",
    userLimit: "ตามตกลง",
    deviceLimit: "ตามตกลง",
    productLimit: "ตามตกลง"
  }
];

export const STANDARD_PACKAGE_FEATURES: PackageFeatureRow[] = [
  {
    id: "front_pos",
    label: "ขายหน้าร้าน POS",
    values: { launch_lite: true, starter: true, standard: true, pro: true, business: true }
  },
  {
    id: "takeaway",
    label: "ขายกลับบ้าน",
    values: { launch_lite: true, starter: true, standard: true, pro: true, business: true }
  },
  {
    id: "payment",
    label: "รับเงินสด / โอน / PromptPay QR",
    values: { launch_lite: true, starter: true, standard: true, pro: true, business: true }
  },
  {
    id: "attendance",
    label: "เปิด-ปิดกะพนักงาน",
    values: { launch_lite: true, starter: true, standard: true, pro: true, business: true }
  },
  {
    id: "sales_report",
    label: "รายงานยอดขาย",
    values: { launch_lite: "30 วัน", starter: "90 วัน", standard: "1 ปี", pro: "2 ปี", business: "เต็ม" }
  },
  {
    id: "users",
    label: "จำนวนผู้ใช้",
    values: { launch_lite: "1-2", starter: "2", standard: "5", pro: "10", business: "ตามตกลง" }
  },
  {
    id: "devices",
    label: "จำนวนเครื่อง POS",
    values: { launch_lite: "1", starter: "1", standard: "2", pro: "3-5", business: "ตามตกลง" }
  },
  {
    id: "products",
    label: "เมนูสินค้า",
    values: { launch_lite: "100", starter: "200", standard: "500", pro: "1,500", business: "ตามตกลง" }
  },
  {
    id: "dine_in",
    label: "โต๊ะ Dine-in",
    values: { launch_lite: false, starter: false, standard: true, pro: true, business: true }
  },
  {
    id: "delivery_manual",
    label: "Delivery Manual",
    values: { launch_lite: false, starter: "จำกัด", standard: true, pro: true, business: true }
  },
  {
    id: "export_csv",
    label: "Export CSV",
    values: { launch_lite: false, starter: false, standard: true, pro: true, business: true }
  },
  {
    id: "roles",
    label: "สิทธิ์ Owner / Manager / Staff",
    values: { launch_lite: false, starter: "พื้นฐาน", standard: true, pro: true, business: true }
  },
  {
    id: "cancel_pin",
    label: "PIN อนุมัติยกเลิกบิล",
    values: { launch_lite: false, starter: false, standard: true, pro: true, business: true }
  },
  {
    id: "qr_table",
    label: "QR สั่งอาหารที่โต๊ะ",
    values: { launch_lite: false, starter: false, standard: false, pro: true, business: true }
  },
  {
    id: "qr_call_staff",
    label: "ลูกค้าเรียกพนักงานผ่าน QR",
    values: { launch_lite: false, starter: false, standard: false, pro: true, business: true }
  },
  {
    id: "kitchen_ticket",
    label: "จอครัว / Kitchen Ticket",
    values: { launch_lite: false, starter: false, standard: false, pro: true, business: true }
  },
  {
    id: "stock_recipe",
    label: "สต๊อกวัตถุดิบ + สูตรอาหาร",
    values: { launch_lite: false, starter: false, standard: false, pro: true, business: true }
  },
  {
    id: "multi_branch",
    label: "หลายสาขา / Dashboard รวม",
    values: { launch_lite: false, starter: false, standard: false, pro: false, business: true }
  },
  {
    id: "priority_support",
    label: "Support Priority",
    values: { launch_lite: false, starter: false, standard: false, pro: true, business: true }
  }
];

export function getStandardPackageByCode(code: string): StandardPackagePlan | null {
  return STANDARD_PACKAGE_PLANS.find((plan) => plan.code === code) ?? null;
}
