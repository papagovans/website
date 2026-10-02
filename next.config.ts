import { readFileSync } from "node:fs";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

/*
 * Redirects are generated from seo/live-urls.json, never hand-written here.
 *
 * That file is the record of every URL papagovans.com publishes today. Keeping
 * the redirects derived from it means the map and the implementation cannot
 * drift, and `npm run urls:check` verifies after every build that what the
 * fixture promises is what the build actually serves.
 */
type LiveUrl = { path: string; status: string; to?: string; note?: string };
const live = JSON.parse(
  readFileSync(new URL("./seo/live-urls.json", import.meta.url), "utf8"),
) as { urls: LiveUrl[] };

const nextConfig: NextConfig = {
  /*
   * papagovans.com publishes every URL with a trailing slash. Next strips it by
   * default, which would make every page we rebuild a different URL from the one
   * Google has indexed. Non-negotiable for this migration.
   */
  trailingSlash: true,

  /*
   * The stylesheet arrives inside the HTML instead of as a separate request
   * the page has to wait for. Measured with Lighthouse on mobile: the two
   * render-blocking stylesheets held the first paint back about half a
   * second. The site's CSS is ~13 KB compressed, and most visitors are new,
   * so re-sending it with each page is the cheaper side of the trade.
   */
  experimental: { inlineCss: true, globalNotFound: true },

  /*
   * Images the old WordPress site served. Emails, Google listings and other
   * sites still link to them, and WordPress lives on at WP Engine after the
   * domain moves, so they are fetched from there rather than breaking.
   */
  async rewrites() {
    return [{ source: "/wp-content/uploads/:path*", destination: "https://papagovans.wpengine.com/wp-content/uploads/:path*" }];
  },

  async redirects() {
    return [
      // One address for search engines: www goes to papagovans.com.
      // Next has already dropped the trailing slash, so it goes back on here: one hop, not two.
      { source: "/", has: [{ type: "host" as const, value: "www.papagovans.com" }], destination: "https://papagovans.com/", statusCode: 301 },
      { source: "/:path+", has: [{ type: "host" as const, value: "www.papagovans.com" }], destination: "https://papagovans.com/:path+/", statusCode: 301 },
      ...live.urls
      .filter((u) => u.status === "redirect" && u.to)
      .map((u) => ({
        source: u.path.replace(/\/$/, ""),
        destination: u.to!,
        // 301, set explicitly. Next's `permanent: true` emits 308, which Google
        // treats identically, but every SEO tool and auditor looks for a 301.
        // No reason to make anyone wonder.
        statusCode: 301,
      })),
    ];
  },

  /*
   * noindex everywhere except papagovans.com itself, so staging and preview
   * links never compete with the live site in search, and going live needs no
   * change here. Same rule as app/robots.ts. Hosts are spelled out because
   * next.config cannot import lib/site.ts's LIVE_HOSTS before the build.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        missing: [
          { type: "host", value: "papagovans.com" },
          { type: "host", value: "www.papagovans.com" },
        ],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      /*
       * The files in /public have fixed names, so Vercel serves them with
       * max-age=0 and every visit re-asks for the logo. A week in the browser,
       * then served stale while it checks for a new copy: a changed logo
       * shows within a week without anyone renaming the file. Photos do not
       * live here; they are in the Media Library with year-long caching.
       */
      ...["/home/:file*", "/brand/:file*", "/explore-the-van/:file*", "/favicon.:ext"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      })),
    ];
  },
};

export default withPayload(nextConfig);
