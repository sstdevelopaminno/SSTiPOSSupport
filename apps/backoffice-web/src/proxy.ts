import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AppSurface = "pos" | "it_admin" | "all";

const IT_ADMIN_PATH_PREFIXES = ["/it-admin", "/api/it-admin", "/audit-logs", "/tenants"];
const POS_PATH_PREFIXES = ["/preview/pos", "/api/pos", "/login", "/api/auth", "/api/store", "/table-order"];

function resolvePosSessionCookieNames() {
  const handoffName = String(process.env.POS_SESSION_COOKIE_NAME ?? "pos_session_handoff").trim() || "pos_session_handoff";
  const sessionIdName = String(process.env.POS_SESSION_ID_COOKIE_NAME ?? "pos_session_id").trim() || "pos_session_id";

  return { handoffName, sessionIdName };
}

function appSurface(): AppSurface {
  const raw = String(process.env.APP_SURFACE ?? "it_admin").trim().toLowerCase();
  if (raw === "pos" || raw === "it_admin" || raw === "all") return raw;
  return "it_admin";
}

function parseHosts(raw: string | undefined): string[] {
  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, "");
}

function hostAllowed(request: NextRequest, allowedHosts: string[]): boolean {
  if (allowedHosts.length === 0) return true;
  const host = normalizeHost(request.headers.get("host") ?? "");
  return allowedHosts.some((allowed) => normalizeHost(allowed) === host);
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectToHost(request: NextRequest, host: string): NextResponse {
  const url = request.nextUrl.clone();
  url.host = host;
  return withSupportNoStoreHeaders(NextResponse.redirect(url));
}

function redirectToSurfaceLogin(request: NextRequest, surface: Exclude<AppSurface, "all">): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = surface === "pos" ? "/login/store" : "/it-admin/login";
  url.search = "";
  url.searchParams.set("blocked", surface === "pos" ? "it_admin_surface" : "pos_surface");
  return surface === "it_admin" ? withSupportNoStoreHeaders(NextResponse.redirect(url)) : NextResponse.redirect(url);
}

function redirectToPosLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login/store";
  url.search = "";
  return NextResponse.redirect(url);
}

function hasPosSession(request: NextRequest): boolean {
  const { handoffName, sessionIdName } = resolvePosSessionCookieNames();
  return Boolean(request.cookies.get(sessionIdName)?.value || request.cookies.get(handoffName)?.value);
}

function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

function hasLocalDevAuthContext(): boolean {
  return process.env.NODE_ENV !== "production" && Boolean(String(process.env.DEV_AUTH_USER_ID ?? "").trim());
}

function withSupportNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export function proxy(request: NextRequest) {
  const surface = appSurface();
  const pathname = request.nextUrl.pathname;

  if (surface !== "all") {
    const allowedHosts =
      surface === "pos" ? parseHosts(process.env.POS_ALLOWED_HOSTS) : parseHosts(process.env.IT_ADMIN_ALLOWED_HOSTS);
    if (!hostAllowed(request, allowedHosts)) {
      const firstAllowedHost = allowedHosts[0];
      return firstAllowedHost ? redirectToHost(request, firstAllowedHost) : redirectToSurfaceLogin(request, surface);
    }

    if (surface === "pos" && matchesPrefix(pathname, IT_ADMIN_PATH_PREFIXES)) {
      return redirectToSurfaceLogin(request, "pos");
    }

    if (surface === "it_admin") {
      if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/it-admin/login";
        return withSupportNoStoreHeaders(NextResponse.redirect(url));
      }
      if (pathname === "/it-admin" && !hasSupabaseSession(request) && !hasLocalDevAuthContext()) {
        const url = request.nextUrl.clone();
        url.pathname = "/it-admin/login";
        url.search = "";
        url.searchParams.set("state", "session_expired");
        return withSupportNoStoreHeaders(NextResponse.redirect(url));
      }
      if (matchesPrefix(pathname, POS_PATH_PREFIXES)) {
        return redirectToSurfaceLogin(request, "it_admin");
      }
    }
  }

  if ((surface === "all" || surface === "pos") && matchesPrefix(pathname, ["/preview/pos"]) && !hasPosSession(request)) {
    return redirectToPosLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
