import { readFileSync } from "node:fs";
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

  async redirects() {
    return live.urls
      .filter((u) => u.status === "redirect" && u.to)
      .map((u) => ({
        source: u.path.replace(/\/$/, ""),
        destination: u.to!,
        // 301. These are permanent: the old URL is never coming back, and we
        // want the authority to move rather than be lent.
        permanent: true,
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
    ];
  },
};

export default nextConfig;
