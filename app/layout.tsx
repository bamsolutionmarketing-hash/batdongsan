import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PWARegister } from "@/components/pwa/PWA";

// Inter — geometric neo-grotesque, the de-facto modern UI sans (latin + vi).
const sans = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NhaPilot — AI Copilot cho môi giới BĐS",
  description: "NhaPilot: trợ lý nội dung bán hàng bất động sản — bản đồ tri thức dự án + máy gợi ý bài, soạn caption đúng dữ liệu.",
  applicationName: "NhaPilot",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "NhaPilot", statusBarStyle: "black" },
  icons: {
    icon: "/brand/mark.svg",
    shortcut: "/brand/icon-192.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1322",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={sans.variable}>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
        <PWARegister />
      </body>
    </html>
  );
}
