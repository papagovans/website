/*
 * Pulls every URL papagovans.com currently publishes and writes seo/live-urls.json.
 *
 * This file is the contract the rebuild is held to: nothing Google knows about
 * today may quietly stop resolving. Re-run it whenever the live site changes;
 * it preserves any `status` and `to` a human has already set, so classification
 * work is never lost.
 *
 *   node scripts/fetch-live-urls.mjs
 *
 * status values
 *   todo      not rebuilt yet. Allowed to be missing. The migration backlog.
 *   done      rebuilt at this exact path. Must resolve, or the build fails.
 *   redirect  not rebuilt. Must 301 to `to`, or the build fails.
 *   drop      deliberately gone, with a reason. Never use without one.
 */

const LIVE = "https://papagovans.com";
const OUT = new URL("../seo/live-urls.json", import.meta.url);

/*
 * Junk in the live sitemap. Each of these is indexed today and should not be
 * rebuilt, but must still resolve, because a URL Google knows about that starts
 * returning 404 is a worse outcome than a redirect nobody follows.
 *
 * The seven "-old" pages are the expensive ones: /zion-old/ and /zion/ are both
 * indexed and competing for the same queries, which splits the authority of our
 * highest-intent pages. Search Console decides which way each arrow points. If
 * the "-old" page is the one actually ranking, the redirect reverses and this
 * map is wrong.
 */
const OVERRIDES = {
  "/test/": { status: "redirect", to: "/", note: "scratch page, indexed by accident" },
  "/elementor-10246/": { status: "redirect", to: "/", note: "page-builder artefact" },
  "/login/": { status: "redirect", to: "/", note: "WordPress login, no equivalent" },
  "/which-adventure-van-style-fits-you-cloned-10193/": {
    status: "redirect",
    to: "/which-adventure-van-style-fits-you/",
    note: "duplicate of the quiz",
  },
};

const isJunk = (p) => p in OVERRIDES;

async function sitemapUrls(index) {
  const xml = await (await fetch(index)).text();
  const maps = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const out = [];
  for (const m of maps) {
    const t = await (await fetch(m)).text();
    const type = m.split("/").pop().replace("-sitemap.xml", "");
    for (const u of [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])) {
      out.push({ path: new URL(u).pathname, type });
    }
  }
  return out;
}

const found = await sitemapUrls(`${LIVE}/sitemap_index.xml`);
const paths = new Set(found.map((f) => f.path));

let previous = {};
try {
  const old = JSON.parse(await (await import("node:fs/promises")).readFile(OUT, "utf8"));
  previous = Object.fromEntries(old.urls.map((u) => [u.path, u]));
} catch {}

const urls = found
  .map(({ path, type }) => {
    const prior = previous[path];
    // A human decision already recorded wins over anything inferred here.
    if (prior && prior.status !== "todo") return { ...prior, type };

    if (isJunk(path)) return { path, type, ...OVERRIDES[path] };

    // "/zion-old/" beside a live "/zion/" is a duplicate, not a page.
    const m = path.match(/^(.*)-old\/$/);
    if (m && paths.has(`${m[1]}/`)) {
      return {
        path,
        type,
        status: "redirect",
        to: `${m[1]}/`,
        note: "duplicate competing with its own live counterpart",
      };
    }

    const out = { path, type, status: "todo" };
    // Conversion confirmations are real pages that must never rank.
    if (/^\/thank-you/.test(path)) out.note = "must ship noindex";
    return out;
  })
  .sort((a, b) => a.path.localeCompare(b.path));

const counts = urls.reduce((a, u) => ((a[u.status] = (a[u.status] || 0) + 1), a), {});
const doc = {
  source: LIVE,
  generated: new Date().toISOString().slice(0, 10),
  total: urls.length,
  counts,
  urls,
};

await (await import("node:fs/promises")).writeFile(OUT, JSON.stringify(doc, null, 2) + "\n");
console.log(`${urls.length} live URLs ->`, counts);
