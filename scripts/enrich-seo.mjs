/*
 * Pulls the live site's SEO layer into seo/live-urls.json.
 *
 * papagovans.com exposes Yoast's output through the public REST API, so the
 * title, canonical and robots directive for every URL are readable without any
 * credentials. That is the data the rebuild has to reproduce: a page rebuilt at
 * the right path with the wrong title or a canonical pointing somewhere else is
 * still a lost page.
 *
 *   node scripts/enrich-seo.mjs
 */

import { readFile, writeFile } from "node:fs/promises";

const LIVE = "https://papagovans.com";
const TYPES = ["pages", "posts", "projects", "build"];
const OUT = new URL("../seo/live-urls.json", import.meta.url);

const byPath = new Map();

for (const type of TYPES) {
  for (let page = 1; ; page++) {
    const res = await fetch(
      `${LIVE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=id,link,yoast_head_json`,
    );
    if (!res.ok) break;
    const rows = await res.json();
    if (!rows.length) break;
    for (const r of rows) {
      const y = r.yoast_head_json ?? {};
      byPath.set(new URL(r.link).pathname, {
        wpId: r.id,
        title: y.title ?? null,
        canonical: y.canonical ? new URL(y.canonical).pathname : null,
        index: y.robots?.index ?? null,
      });
    }
    if (rows.length < 100) break;
  }
  process.stdout.write(`${type} `);
}
console.log();

const doc = JSON.parse(await readFile(OUT, "utf8"));
let matched = 0;
for (const u of doc.urls) {
  const seo = byPath.get(u.path);
  if (!seo) continue;
  matched++;
  u.seo = seo;
}

doc.enriched = new Date().toISOString().slice(0, 10);
await writeFile(OUT, JSON.stringify(doc, null, 2) + "\n");

/* Anything indexable whose canonical points elsewhere is already telling Google
 * to rank a different page. Worth knowing before we rebuild it. */
const odd = doc.urls.filter((u) => u.seo && u.seo.canonical && u.seo.canonical !== u.path);
const noindex = doc.urls.filter((u) => u.seo && u.seo.index === "noindex");

console.log(`matched ${matched}/${doc.urls.length}`);
console.log(`already noindex on the live site: ${noindex.length}`);
console.log(`canonical points elsewhere:       ${odd.length}`);
if (odd.length) for (const u of odd.slice(0, 15)) console.log(`   ${u.path}  ->  ${u.seo.canonical}`);
