import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const supportCleanupHeaders = [
  { key: "Clear-Site-Data", value: "\"cache\", \"storage\"" },
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    lockDistDir: false,
    webpackBuildWorker: false
  },
  transpilePackages: ["@pos/shared-types", "@pos/pos-domain", "@pos/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          ...securityHeaders,
          ...supportCleanupHeaders,
          { key: "Service-Worker-Allowed", value: "/" }
        ]
      },
      {
        source: "/",
        headers: [...securityHeaders, ...supportCleanupHeaders]
      },
      {
        source: "/it-admin/login",
        headers: [...securityHeaders, ...supportCleanupHeaders]
      },
      {
        source: "/login/store",
        headers: [...securityHeaders, ...supportCleanupHeaders]
      },
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
