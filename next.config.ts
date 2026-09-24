import type { NextConfig } from "next";

/*
 * Staging only. Every response carries noindex so a copy of the marketing site
 * on our own root domain can never compete with papagovans.com in search.
 * Remove this header, deliberately, on the day this becomes the live site.
 */
const nextConfig: NextConfig = {
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
