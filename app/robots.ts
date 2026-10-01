import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { LIVE_HOSTS, SITE_URL } from "@/lib/site";

/* Crawlable only when served as papagovans.com. Staging, Vercel preview links
   and anything else stay closed, so launch day is a DNS change and nobody has
   to remember to flip a setting. The X-Robots-Tag header in next.config.ts
   follows the same rule. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  if (!LIVE_HOSTS.includes(host)) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
