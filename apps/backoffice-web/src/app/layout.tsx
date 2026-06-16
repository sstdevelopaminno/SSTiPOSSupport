import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaBootstrap } from "@/components/pwa/pwa-bootstrap";
import "./globals.css";

const appSurface = String(process.env.APP_SURFACE ?? "it_admin").trim().toLowerCase();
const isSupportSurface = appSurface !== "pos";

export const metadata: Metadata = {
  title: isSupportSurface ? "SSTiPOS Support" : "SSTiPOS",
  description: isSupportSurface ? "SSTiPOS Support IT operations console" : "Multi-tenant POS back office and IT admin",
  ...(isSupportSurface ? {} : { manifest: "/manifest.webmanifest" }),
  icons: {
    icon: [
      {
        url: "/icons/sstipos-browser-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/sstipos-browser-icon.png",
    apple: "/icons/sstipos-browser-icon.png",
  },
  ...(isSupportSurface
    ? {}
    : {
        appleWebApp: {
          capable: true,
          title: "SSTiPOS",
          statusBarStyle: "default" as const,
        },
      }),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="m-0 h-full w-full p-0">
      <body className="m-0 h-full w-full overflow-hidden p-0">
        {children}
        <PwaBootstrap />
      </body>
    </html>
  );
}
