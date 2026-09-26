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

  async redirects() {
    return live.urls
      .filter((u) => u.status === "redirect" && u.to)
      .map((u) => ({
        source: u.path.replace(/\/$/, ""),
        destination: u.to!,
        // 301, set explicitly. Next's `permanent: true` emits 308, which Google
        // treats identically, but every SEO tool and auditor looks for a 301.
        // No reason to make anyone wonder.
        statusCode: 301,
      }));
  },

  /*
   * Staging only. A copy of the marketing site on our own root domain must never
   * compete with papagovans.com in search. Remove this, deliberately, on the day
   * this becomes the live site.
   */
  async headers() {
    return [
      {
        source: "/:path*",
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
