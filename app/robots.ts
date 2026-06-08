import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nhapilot.com").replace(/\/$/, "");

// Allow public marketing + free knowledge maps; keep the authenticated app and
// APIs out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/kmap", "/p", "/pricing", "/contact"],
        disallow: ["/dashboard", "/projects", "/scripts", "/notes", "/calculator", "/settings", "/calendar", "/devices", "/onboarding", "/admin", "/api"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
