import type { MetadataRoute } from "next";

// PWA manifest → enables "Add to Home Screen" as a standalone app (NhaPilot).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NhaPilot — AI Copilot cho môi giới BĐS",
    short_name: "NhaPilot",
    description: "Trợ lý nội dung bán hàng bất động sản: bản đồ tri thức + gợi ý bài + ảnh đóng logo.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1322",
    theme_color: "#0b1322",
    lang: "vi",
    categories: ["business", "productivity"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
