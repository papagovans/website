/*
 * Holds the rebuild to seo/live-urls.json.
 *
 * Run after `next build`. Reads what the build actually produced rather than
 * guessing from the filesystem, so a route that fails to generate is caught
 * here and not by a customer.
 *
 *   node scripts/check-urls.mjs            fails if anything already migrated regressed
 *   node scripts/check-urls.mjs --strict   also fails on anything still todo (launch gate)
 *
 * The default is deliberately lenient about `todo`. A gate that is red for the
 * whole build is a gate people learn to ignore. This one is green today and
 * goes red the moment a URL that was working stops working.
 */

import { readFile } from "node:fs/promises";

const strict = process.argv.includes("--strict");
const root = new URL("../", import.meta.url);

const read = async (p) => JSON.parse(await readFile(new URL(p, root), "utf8"));

const fixture = await read("seo/live-urls.json");

let routes, prerender;
try {
  routes = await read(".next/routes-manifest.json");
  prerender = await read(".next/prerender-manifest.json");
} catch {
  console.error("No build output found. Run `npm run build` first.");
  process.exit(2);
}

const norm = (p) => (p === "/" ? "/" : p.replace(/\/+$/, ""));

const served = new Set([
  ...Object.keys(prerender.routes ?? {}).map(norm),
  ...(routes.staticRoutes ?? []).map((r) => norm(r.page)),
]);
const dynamic = (routes.dynamicRoutes ?? []).map((r) => new RegExp(r.regex));
const redirects = (routes.redirects ?? []).map((r) => ({
  from: norm(r.source),
  to: r.destination,
}));

const resolves = (p) => served.has(p) || dynamic.some((re) => re.test(p) || re.test(p + "/"));

const fail = [];
const counts = { done: 0, redirect: 0, todo: 0, drop: 0 };

for (const u of fixture.urls) {
  const p = norm(u.path);
  counts[u.status] = (counts[u.status] ?? 0) + 1;

  if (u.status === "done") {
    if (!resolves(p)) fail.push(`${u.path}  marked done but the build serves no such route`);
  } else if (u.status === "redirect") {
    const hit = redirects.find((r) => r.from === p);
    if (!hit) fail.push(`${u.path}  marked redirect but no redirect is declared`);
    else if (norm(hit.to) !== norm(u.to)) {
      fail.push(`${u.path}  redirects to ${hit.to}, fixture expects ${u.to}`);
    }
  } else if (u.status === "drop") {
    if (!u.note) fail.push(`${u.path}  dropped with no reason recorded`);
  } else if (u.status === "todo" && strict) {
    fail.push(`${u.path}  still todo`);
  }
}

const covered = counts.done + counts.redirect;
const pct = ((covered / fixture.total) * 100).toFixed(1);

console.log(`\nSEO URL coverage: ${covered}/${fixture.total} (${pct}%)`);
console.log(`  done ${counts.done}   redirect ${counts.redirect}   todo ${counts.todo}   drop ${counts.drop}\n`);

if (fail.length) {
  console.error(`${fail.length} problem${fail.length > 1 ? "s" : ""}:\n`);
  for (const f of fail) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

console.log(strict ? "Every live URL resolves. Safe to launch.\n" : "No regressions.\n");
