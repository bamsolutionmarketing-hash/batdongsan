import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// Elegant display serif for luxury headings (latin + Vietnamese).
const display = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trợ lý BĐS",
  description: "Trợ lý nội dung bán hàng bất động sản — bản đồ dự án + máy gợi ý bài.",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
