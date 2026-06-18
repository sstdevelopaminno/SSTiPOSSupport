"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

type TenantItem = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  package_id: string | null;
  branch_count: number;
  active_session_count: number;
};

type TenantResponse = {
  data: { tenants: TenantItem[] };
  error: { code: string; message: string } | null;
};

export type TenantIndexLabels = {
  title: string;
  desc: string;
  tenant: string;
  status: string;
  branches: string;
  activeSessions: string;
  actions: string;
  active: string;
  inactive: string;
  manage: string;
  devices: string;
  sessions: string;
  refresh: string;
  loading: string;
  empty: string;
  fetchFailed: string;
};

type TenantIndexConsoleProps = {
  labels: TenantIndexLabels;
};

export function TenantIndexConsole({ labels }: TenantIndexConsoleProps) {
  const [items, setItems] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/it-admin/admin/tenants", { cache: "no-store" });
      const payload = (await response.json()) as TenantResponse;
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? labels.fetchFailed);
      }
      setItems(payload.data.tenants ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : labels.fetchFailed);
    } finally {
      setLoading(false);
    }
  }, [labels.fetchFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="surface" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{labels.title}</h2>
        <button type="button" className="pos-monitor-btn pos-monitor-btn--primary" onClick={() => void load()} disabled={loading}>
          {loading ? labels.loading : labels.refresh}
        </button>
      </div>
      <p style={{ margin: 0, color: "#64748b" }}>{labels.desc}</p>
      {error ? <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p> : null}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>{labels.tenant}</th>
              <th style={thStyle}>{labels.status}</th>
              <th style={thStyle}>{labels.branches}</th>
              <th style={thStyle}>{labels.activeSessions}</th>
              <th style={thStyle}>{labels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <small style={{ color: "#64748b" }}>{item.code}</small>
                </td>
                <td style={tdStyle}>{item.is_active ? labels.active : labels.inactive}</td>
                <td style={tdStyle}>{item.branch_count}</td>
                <td style={tdStyle}>{item.active_session_count}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <Link href={`/tenants/${item.id}/branches`} style={pillStyle}>
                      {labels.manage}
                    </Link>
                    <Link href={`/tenants/${item.id}/devices`} style={pillStyle}>
                      {labels.devices}
                    </Link>
                    <Link href={`/tenants/${item.id}/sessions`} style={pillStyle}>
                      {labels.sessions}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td style={{ ...tdStyle, textAlign: "center", color: "#64748b" }} colSpan={5}>
                  {labels.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const thStyle: CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  padding: "8px 6px"
};

const tdStyle: CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
  padding: "8px 6px"
};

const pillStyle: CSSProperties = {
  border: "1px solid #dbe3ef",
  borderRadius: 999,
  padding: "6px 10px",
  background: "#fff",
  display: "inline-flex",
  alignItems: "center"
};
