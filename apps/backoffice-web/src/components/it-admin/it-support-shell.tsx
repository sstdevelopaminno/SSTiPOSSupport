"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import type { Language } from "@/lib/i18n";

type NavItem = {
  href: string;
  label: string;
  permission: string;
};

type ItSupportShellProps = {
  children: ReactNode;
  nav: NavItem[];
  roleLabel: string;
  accountLabel: string;
  envLabel: string;
  language: Language;
  languageLabel: string;
  thaiLabel: string;
  englishLabel: string;
};

const logoSrc = "/brand/sst-innovation-logo.png";
const logoWidth = 190;
const logoHeight = 51;
const sidebarCollapsedStorageKey = "sstipos-support-sidebar-collapsed";

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function NavIcon({ permission }: { permission: string }) {
  switch (permission) {
    case "tenant_manage":
      return (
        <IconSvg>
          <path d="M4 20V6.5L12 3l8 3.5V20" />
          <path d="M8 20v-8h8v8" />
          <path d="M8 8h.01M12 8h.01M16 8h.01" />
        </IconSvg>
      );
    case "branch_manage":
      return (
        <IconSvg>
          <path d="M6 20V5" />
          <path d="M18 20v-6" />
          <path d="M6 8h7a3 3 0 0 1 3 3v3" />
          <circle cx="6" cy="5" r="2" />
          <circle cx="18" cy="14" r="2" />
        </IconSvg>
      );
    case "package_read":
      return (
        <IconSvg>
          <path d="M4 8l8-4 8 4-8 4-8-4Z" />
          <path d="M4 8v8l8 4 8-4V8" />
          <path d="M12 12v8" />
        </IconSvg>
      );
    case "user_role_manage":
      return (
        <IconSvg>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 11l2 2 3-4" />
        </IconSvg>
      );
    case "session_manage":
      return (
        <IconSvg>
          <rect x="4" y="5" width="16" height="12" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M8 11h4l2-3 2 6 1-3h2" />
        </IconSvg>
      );
    case "shift_manage":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
          <path d="M6 4l-2 2" />
          <path d="M18 4l2 2" />
        </IconSvg>
      );
    case "audit_read":
      return (
        <IconSvg>
          <path d="M8 4h8l2 3v13H6V7l2-3Z" />
          <path d="M9 10h6" />
          <path d="M9 14h3" />
          <circle cx="16" cy="16" r="2" />
          <path d="M17.5 17.5L20 20" />
        </IconSvg>
      );
    case "monitoring_read":
      return (
        <IconSvg>
          <path d="M4 13h4l2-6 4 10 2-5h4" />
          <path d="M5 20h14" />
        </IconSvg>
      );
    case "feature_manage":
      return (
        <IconSvg>
          <path d="M5 7h14" />
          <path d="M5 12h14" />
          <path d="M5 17h14" />
          <circle cx="9" cy="7" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="11" cy="17" r="2" />
        </IconSvg>
      );
    case "device_manage":
      return (
        <IconSvg>
          <rect x="8" y="3" width="8" height="18" rx="2" />
          <path d="M11 18h2" />
          <path d="M17 8h2a2 2 0 0 1 2 2v3" />
        </IconSvg>
      );
    case "customer_display_manage":
      return (
        <IconSvg>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M8 10h8" />
        </IconSvg>
      );
    case "platform_user_manage":
      return (
        <IconSvg>
          <path d="M12 3l7 3v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3Z" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8.5 16a3.8 3.8 0 0 1 7 0" />
        </IconSvg>
      );
    case "settings_manage":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
        </IconSvg>
      );
    case "dashboard_read":
    default:
      return (
        <IconSvg>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </IconSvg>
      );
  }
}

function getPageTitle(pathname: string, nav: NavItem[]) {
  const active = nav
    .filter((item) => {
      const path = item.href.split("#")[0] || item.href;
      return path === "/it-admin" ? pathname === path : pathname.startsWith(path);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  return active?.label ?? "Support Console";
}

export function ItSupportShell({
  children,
  nav,
  roleLabel,
  language,
  languageLabel,
  thaiLabel,
  englishLabel
}: ItSupportShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname, nav), [pathname, nav]);
  const showPackageBackLink = /^\/it-admin\/packages\/[^/]+/.test(pathname);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem(sidebarCollapsedStorageKey) === "true");
  }, []);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(sidebarCollapsedStorageKey, String(next));
      return next;
    });
  }

  async function logout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      await fetch("/api/it-admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/it-admin/login?state=signed_out");
      router.refresh();
    }
  }

  const sidebar = (
    <aside className="it-support-sidebar" aria-label="SSTiPOS Support navigation">
      <div className="it-support-sidebar__brand">
        <div className="it-support-sidebar__logo">
          <Image src={logoSrc} alt="SST Innovation" width={logoWidth} height={logoHeight} style={{ height: "auto" }} priority />
        </div>
        <span className="it-support-role-badge">{roleLabel}</span>
        <button
          type="button"
          className="it-support-sidebar__collapse"
          aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
          aria-pressed={sidebarCollapsed}
          onClick={toggleSidebarCollapsed}
          title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="it-support-sidebar__nav">
        {nav.map((item) => {
          const path = item.href.split("#")[0] || item.href;
          const active = path === "/it-admin" ? pathname === path : pathname.startsWith(path);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              className={active ? "it-support-nav-item is-active" : "it-support-nav-item"}
              href={item.href}
              title={item.label}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="it-support-nav-item__icon" aria-hidden="true">
                <NavIcon permission={item.permission} />
              </span>
              <span className="it-support-nav-item__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="it-support-sidebar__tools">
        <LanguageSwitcher
          currentLanguage={language}
          label=""
          thaiLabel={thaiLabel}
          englishLabel={englishLabel}
          compact
        />
        <button type="button" className="it-support-logout" onClick={logout} disabled={logoutBusy}>
          {logoutBusy ? "Signing out..." : "Logout"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className={sidebarCollapsed ? "it-support-app-shell is-sidebar-collapsed" : "it-support-app-shell"}>
      <button
        type="button"
        className="it-support-drawer-backdrop"
        aria-label="Close menu"
        data-open={drawerOpen ? "true" : "false"}
        onClick={() => setDrawerOpen(false)}
      />

      <div className="it-support-desktop-sidebar">{sidebar}</div>
      <div className="it-support-mobile-sidebar" data-open={drawerOpen ? "true" : "false"}>
        {sidebar}
      </div>

      <main className="it-support-main">
        <header className="it-support-topbar">
          <div className="it-support-topbar__title">
            <button
              type="button"
              className="it-support-menu-button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <p>SSTiPOS Support Console</p>
              <h2>{pageTitle}</h2>
            </div>
          </div>

          <div className="it-support-topbar__actions">
            {showPackageBackLink ? (
              <Link className="it-support-topbar__back" href="/it-admin/packages">
                กลับไปตารางแพ็กเกจ
              </Link>
            ) : null}
          </div>
        </header>

        <div className="it-support-content">{children}</div>
      </main>
    </div>
  );
}
