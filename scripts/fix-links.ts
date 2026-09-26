/**
 * Points links inside CMS content at the page they end up on.
 *
 *   npx tsx scripts/fix-links.ts          # list what would change
 *   npx tsx scripts/fix-links.ts --write  # change it
 *
 * Old WordPress content links to addresses that now redirect (/recent-projects/,
 * /privacy) or to papagovans.com by full address, which on stage opens the
 * old site. A redirect works, but each one is a round trip and search engines
 * prefer links that land directly. Links to WordPress upload files (six empty
 * links to image files on the van type pages) are removed, keeping their text.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const write = process.argv.includes("--write");
const payload = await getPayload({ config });
const fixture = JSON.parse(await readFile("seo/live-urls.json", "utf8")) as { urls: { path: string; status: string; to?: string }[] };
const redirect = new Map(fixture.urls.filter((u) => u.status === "redirect" && u.to).map((u) => [u.path, u.to!]));

function target(url: string): string | null {
  let u = url.trim();
  const abs = u.match(/^https?:\/\/(www\.)?papagovans\.com(\/.*)?$/i);
  if (abs) u = abs[2] || "/";
  if (/^\/wp-content\//.test(u)) return null; // an upload file: drop the link
  const [path, rest = ""] = u.split(/(?=[?#])/);
  if (!path.startsWith("/")) return url;
  let p = path.endsWith("/") || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  for (let i = 0; i < 5 && redirect.has(p); i++) p = redirect.get(p)!;
  return p + rest;
}

type Node = { type?: string; fields?: { url?: string; linkType?: string }; children?: Node[] };
const changes: string[] = [];
function walk(n: Node, where: string): boolean {
  let changed = false;
  if (Array.isArray(n.children)) {
    const out: Node[] = [];
    for (const c of n.children) {
      if ((c.type === "link" || c.type === "autolink") && c.fields?.url && c.fields.linkType !== "internal") {
        const to = target(c.fields.url);
        if (to === null) { changes.push(`${where}: remove link ${c.fields.url}`); out.push(...(c.children ?? [])); changed = true; continue; }
        if (to !== c.fields.url) { changes.push(`${where}: ${c.fields.url} -> ${to}`); c.fields.url = to; changed = true; }
      }
      if (walk(c, where)) changed = true;
      out.push(c);
    }
    n.children = out;
  }
  return changed;
}
/* Any Lexical document anywhere in a record: { root: { children: [...] } }. */
function scan(v: unknown, where: string): boolean {
  if (!v || typeof v !== "object") return false;
  if ("root" in (v as object) && (v as { root?: Node }).root?.children) return walk((v as { root: Node }).root, where);
  let changed = false;
  for (const x of Array.isArray(v) ? v : Object.values(v)) if (scan(x, where)) changed = true;
  return changed;
}

for (const [collection, fields] of [["pages", ["sections"]], ["posts", ["body"]], ["builds", ["description"]]] as const) {
  const { docs } = await payload.find({ collection, pagination: false, depth: 0 });
  for (const doc of docs) {
    const data: Record<string, unknown> = {};
    for (const f of fields) if (scan((doc as Record<string, unknown>)[f], `${collection}/${doc.slug}`)) data[f] = (doc as Record<string, unknown>)[f];
    if (write && Object.keys(data).length) await payload.update({ collection, id: doc.id, data: data as never });
  }
}
console.log(changes.join("\n") || "no links to change");
console.log(`${changes.length} link${changes.length === 1 ? "" : "s"} ${write ? "changed" : "would change (run with --write)"}`);
process.exit(0);
