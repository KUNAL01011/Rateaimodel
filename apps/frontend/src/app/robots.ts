import type { MetadataRoute } from "next";
import { getSettings, SITE_BASE } from "@/lib/server-api";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = SITE_BASE(await getSettings());
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/write-review"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
