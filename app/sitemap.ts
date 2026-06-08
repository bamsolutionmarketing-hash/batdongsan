import type { MetadataRoute } from "next";
import { listPublishedProjects } from "@/lib/repo/projects";

// Public sitemap — surfaces the free knowledge maps so search engines index them
// and pull in organic traffic. Generated at request time (anon RLS).
export const dynamic = "force-dynamic";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nhapilot.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/kmap", "/pricing", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await listPublishedProjects();
    if (res.ok) {
      projectRoutes = res.data.flatMap((p) => [
        { url: `${BASE}/kmap/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE}/p/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
      ]);
    }
  } catch {
    /* DB unavailable at build/edge — static routes still emit */
  }

  return [...staticRoutes, ...projectRoutes];
}
