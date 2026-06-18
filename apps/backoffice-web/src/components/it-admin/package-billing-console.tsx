"use client";

import Link from "next/link";
import { STANDARD_PACKAGE_PLANS } from "@/lib/it-admin-package-standards";

export function PackageBillingConsole() {
  const recommendedPlan = STANDARD_PACKAGE_PLANS.find((plan) => plan.code === "standard");

  return (
    <div className="package-console">
      <section className="package-plan-grid" aria-label="Package plans">
        {STANDARD_PACKAGE_PLANS.map((plan) => (
          <Link
            key={plan.code}
            className={plan.code === recommendedPlan?.code ? "package-plan-card is-recommended" : "package-plan-card"}
            href={`/it-admin/packages/${plan.code}`}
          >
            {plan.badge ? <span className="package-plan-card__badge">{plan.badge}</span> : null}
            <span className="package-plan-card__name">{plan.name}</span>
            <strong>{plan.priceLabel}</strong>
            <p>{plan.note}</p>
            <dl>
              <div>
                <dt>ผู้ใช้</dt>
                <dd>{plan.userLimit}</dd>
              </div>
              <div>
                <dt>เครื่อง POS</dt>
                <dd>{plan.deviceLimit}</dd>
              </div>
              <div>
                <dt>เมนูสินค้า</dt>
                <dd>{plan.productLimit}</dd>
              </div>
            </dl>
            <span className="package-plan-card__action">ดูร้านค้าและสัญญา</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
