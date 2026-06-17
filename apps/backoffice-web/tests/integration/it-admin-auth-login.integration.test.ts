import { beforeEach, describe, expect, it, vi } from "vitest";

const appendAuditLog = vi.fn();
const getSupabaseServerClient = vi.fn();
const getSupabaseServiceClient = vi.fn();

vi.mock("@/lib/audit-log", () => ({
  appendAuditLog
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseServiceClient
}));

type Profile = {
  id: string;
  email: string;
  full_name: string;
  platform_role: "it_admin" | "it_support" | "tenant_user";
  is_active: boolean;
};

function createLoginRequest(email = "itadmin@sstipos.local", password = "182536") {
  return new Request("http://localhost/api/it-admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

function mockAuthResult(userId: string | null) {
  getSupabaseServerClient.mockResolvedValue({
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
      signInWithPassword: vi.fn().mockResolvedValue(
        userId
          ? {
              data: { user: { id: userId } },
              error: null
            }
          : {
              data: { user: null },
              error: { message: "Invalid login credentials" }
            }
      )
    }
  });
}

function mockProfileResult(profile: Profile | null) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null })
  };

  getSupabaseServiceClient.mockReturnValue({
    from: vi.fn(() => query)
  });
}

describe("IT admin auth login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendAuditLog.mockResolvedValue(undefined);
  });

  it("allows the local demo it_admin account", async () => {
    mockAuthResult("admin-user");
    mockProfileResult({
      id: "admin-user",
      email: "itadmin@sstipos.local",
      full_name: "SSTiPOS IT Admin",
      platform_role: "it_admin",
      is_active: true
    });

    const { POST } = await import("@/app/api/it-admin/auth/login/route");
    const response = await POST(createLoginRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.user.platform_role).toBe("it_admin");
    expect(body.data.redirect_to).toBe("/it-admin");
  });

  it("allows the local demo it_support account", async () => {
    mockAuthResult("support-user");
    mockProfileResult({
      id: "support-user",
      email: "itsupport@sstipos.local",
      full_name: "SSTiPOS IT Support",
      platform_role: "it_support",
      is_active: true
    });

    const { POST } = await import("@/app/api/it-admin/auth/login/route");
    const response = await POST(createLoginRequest("itsupport@sstipos.local"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.user.platform_role).toBe("it_support");
    expect(body.data.redirect_to).toBe("/it-admin");
  });

  it("rejects authenticated users without an IT platform role", async () => {
    mockAuthResult("tenant-user");
    mockProfileResult({
      id: "tenant-user",
      email: "owner@demo.local",
      full_name: "Tenant Owner",
      platform_role: "tenant_user",
      is_active: true
    });

    const { POST } = await import("@/app/api/it-admin/auth/login/route");
    const response = await POST(createLoginRequest("owner@demo.local", "Owner#2026"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("invalid_role");
  });

  it("rejects invalid credentials before profile lookup", async () => {
    mockAuthResult(null);

    const { POST } = await import("@/app/api/it-admin/auth/login/route");
    const response = await POST(createLoginRequest("itadmin@sstipos.local", "wrong"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("invalid_credentials");
    expect(getSupabaseServiceClient).not.toHaveBeenCalled();
  });
});
