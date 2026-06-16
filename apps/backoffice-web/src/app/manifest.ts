import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const surface = String(process.env.APP_SURFACE ?? "it_admin").trim().toLowerCase();
  const isSupportSurface = surface !== "pos";

  return {
    id: isSupportSurface ? "/?app=sstipos-support" : "/?app=sstipos",
    name: isSupportSurface ? "SSTiPOS Support" : "SSTiPOS",
    short_name: isSupportSurface ? "SST Support" : "SSTiPOS",
    description: isSupportSurface ? "SSTiPOS Support IT operations console" : "SSTiPOS login + POS web app",
    start_url: isSupportSurface ? "/it-admin/login" : "/login/store",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#071831",
    theme_color: "#0f2a4a",
    icons: [
      {
        src: "/icons/sstipos-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/sstipos-icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/sstipos-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
