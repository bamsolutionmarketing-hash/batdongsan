import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batdongsan Map",
  description: "Bản đồ dự án BĐS dạng force-graph + guidance engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
