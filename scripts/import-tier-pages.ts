/**
 * Rebuilds the five build tier pages (Rainier, McKinley, Zion, Olympus,
 * El Capitan) as Tier Page sections, owner 2026-10-01: laid out like the old
 * site's tier pages instead of one long text block.
 *
 *   npx tsx scripts/import-tier-pages.ts <folder>
 *
 * The folder holds what was pulled off papagovans.com: <old-slug>.json per
 * page (structure and photo names), webp/tier-<photo>.webp, and
 * pages-backup.json, the stage pages as they were before this ran. Text comes
 * from that backup where a page existed, because it carries the 10-01
 * proofread; Rainier had no stage page, so its text is the live page's.
 * Prices are the Build Tiers page's. Safe to re-run: photos match on
 * filename, pages on slug. Already run; edit the pages in /admin from here on.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const DIR = process.argv[2];
if (!DIR) throw new Error("Pass the folder.");
const payload = await getPayload({ config });

type Live = {
  title: string; desc: string; divider: string[]; texts: string[]; images: string[];
  allBgs: [string, string][]; counters: [string, string, string][];
  tablists: { panels: { name: string; photo: string | null; items: string[] }[] }[];
  car: string[][]; pk: { name: string; desc: string }[]; alc: { category: string; items: string[] }[];
  builds: { title: string; href: string }[];
};
type Node = { type: string; tag?: string; text?: string; children?: Node[] };

const TIERS = [
  // Rainier was here; removed from the line-up, owner 2026-10-02. Do not re-add.
  { old: "mammoth", slug: "mckinley", name: "McKinley", tagline: "The Happy Camper", price: 69295 },
  { old: "zion", slug: "zion", name: "Zion", tagline: "The Adventure Seeker", price: 86795 },
  { old: "olympus", slug: "olympus", name: "Olympus", tagline: "The Traveling Nomad", price: 108595 },
  { old: "el-capitan-luxury-van-build", slug: "el-capitan-luxury-van-build", name: "El Capitan", tagline: "The Luxury Explorer", price: 127395 },
];

const cache = new Map<string, number>();
async function photo(file: string | null | undefined, alt: string) {
  if (!file) return undefined;
  const name = `tier-${path.basename(file).replace(/\.(jpe?g|png|webp)$/i, "")}.webp`;
  if (cache.has(name)) return cache.get(name);
  const found = await payload.find({ collection: "media", where: { filename: { equals: name } }, limit: 1 });
  let id = found.docs[0]?.id;
  if (!id) {
    const data = await readFile(path.join(DIR, "webp", name)).catch(() => null);
    if (!data) return console.log(`  no file for ${file}, skipped`), undefined;
    id = (await payload.create({ collection: "media", data: { alt }, file: { data, name, mimetype: "image/webp", size: data.length } })).id;
  }
  cache.set(name, id);
  return id;
}
const photoList = async (files: string[], alt: string) => (await Promise.all(files.map((f) => photo(f, alt)))).filter((x): x is number => typeof x === "number");

const txt = (n: Node): string => n.text ?? (n.children ?? []).map(txt).join("");
const items = (n: Node) => (n.children ?? []).map((li) => txt(li).trim()).filter(Boolean);
const title = (s: string) => s.trim().toLowerCase().replace(/(^|[\s/])\w/g, (c) => c.toUpperCase()).replace(/\bAc\b/, "AC").replace(/\bAgm\b/, "AGM");

/* The stage page's text: the hero line, headline numbers, intro and feature lists. */
function fromStage(nodes: Node[]) {
  const out = { stats: "", introHeading: "", intro: [] as string[], features: [] as { name: string; items: string[] }[], packages: [] as { name: string; description: string }[], alc: [] as { name: string; items: string[] }[] };
  let zone = "";
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i], t = txt(n).trim(), next = nodes[i + 1];
    if (n.type === "heading" && n.tag === "h2") {
      zone = /build\s*features/i.test(t) ? "features" : /package/i.test(t) ? "packages" : /carte/i.test(t) ? "alc" : /highlights|exterior|featured|other/i.test(t) ? "" : out.introHeading ? "" : "intro";
      if (zone === "intro") out.introHeading = t;
      continue;
    }
    if (!zone && /·/.test(t)) out.stats = t;
    if (zone === "intro" && n.type === "paragraph" && t) out.intro.push(t);
    if (zone === "features" && n.type === "heading" && next?.type === "list") out.features.push({ name: title(t), items: items(next) });
    if (zone === "packages" && n.type === "paragraph" && /Package$/.test(t)) out.packages.push({ name: t, description: next && /Package$/.test(txt(next).trim()) ? "" : txt(next).trim() });
    if (zone === "alc" && n.type === "list") {
      const prev = txt(nodes[i - 1]).trim();
      out.alc.push({ name: out.alc.length ? prev : "Electrical", items: items(n) });
    }
  }
  return out;
}

const statParts = (line: string) =>
  line.split("·").map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = p.match(/(\d[\d,.]*\s?(?:gal|Ah|W|V|%))/i)!;
    const label = p.replace(m[0], "").trim();
    return { value: m[0].replace(/\s?gal/i, " gal"), label: label.charAt(0).toUpperCase() + label.slice(1) };
  });

type Old = { slug: string; sections: { blockType: string; content?: { root: { children: Node[] } } }[] };
const backup: Old[] = JSON.parse(await readFile(path.join(DIR, "pages-backup.json"), "utf8"));
const stageNodes = (slug: string) => backup.find((p) => p.slug === slug)?.sections.find((s) => s.blockType === "text")?.content?.root.children;
const sharedText = fromStage(stageNodes("mckinley") ?? []);
/* Package upgrades and a la carte were one shared template on the old site. */
const packages = sharedText.packages.length ? sharedText.packages : [];
const alaCarte = sharedText.alc.map((c) => ({ name: c.name, items: c.items.join("\n") }));

for (const t of TIERS) {
  const live: Live = JSON.parse(await readFile(path.join(DIR, `${t.old}.json`), "utf8"));
  /* trash: Rainier was trashed when the builder dropped it (09-28); this brings it back. */
  const existing = (await payload.find({ collection: "pages", where: { slug: { equals: t.slug } }, limit: 1, depth: 0, trash: true })).docs[0];
  const nodes = stageNodes(t.slug);
  const stage = nodes ? fromStage(nodes) : null;

  const panels = live.tablists[0].panels;
  const features = await Promise.all(panels.map(async (p, i) => {
    const s = stage?.features[i];
    return { name: title(s?.name ?? p.name), photo: await photo(p.photo, `${t.name} ${title(p.name).toLowerCase()}`), items: (s?.items ?? p.items).join("\n") };
  }));
  const stats = stage?.stats
    ? statParts(stage.stats)
    : live.counters.map(([label, v, unit]) => ({ value: `${v}${/^ga/i.test(unit) ? " gal" : unit}`, label: label.charAt(0) + label.slice(1).toLowerCase().replace("agm", "AGM") }));

  const buildIds: number[] = [];
  for (const b of live.builds) {
    const slug = b.href.split("/").filter(Boolean).pop()!;
    const hit = (await payload.find({ collection: "builds", where: { or: [{ slug: { equals: slug } }, { title: { equals: b.title } }] }, limit: 1, depth: 0 })).docs[0];
    if (hit) buildIds.push(hit.id);
    else console.log(`  ${t.name}: no build for ${b.title} (${slug})`);
  }

  const section = {
    blockType: "tierPage" as const,
    name: t.name,
    tagline: t.tagline,
    price: t.price,
    vanAllowance: 75000,
    priceNote: "Includes a $75,000 Mercedes-Benz Sprinter allowance. We also build on the Ford Transit and Ram ProMaster.",
    heroPhoto: await photo(live.allBgs[0][1], `The ${t.name}, a Papago camper van`),
    stats,
    introHeading: t.tagline,
    intro: (stage?.intro.length ? stage.intro : [live.texts.find((x) => x.length > 120)!]).join("\n\n"),
    introPhoto: await photo(live.images[1], `Inside the ${t.name}`),
    features,
    interiorPhotos: await photoList(live.car[0], `Inside a Papago ${t.name}`),
    exteriorPhotos: await photoList(live.car[1], "An exterior upgrade on a Papago van"),
    packages: packages.length ? packages : live.pk.map((p) => ({ name: p.name, description: p.desc })),
    alaCarte: alaCarte.length ? alaCarte : live.alc.map((c) => ({ name: c.category, items: c.items.join("\n") })),
    builds: buildIds,
  };

  const data = {
    title: t.name,
    slug: t.slug,
    heading: t.name,
    seoTitle: existing?.seoTitle ?? live.title.replace(/\s*\|\s*Papago Vans$/, " | Papago Vans"),
    seoDescription: existing?.seoDescription ?? live.desc,
    _status: "published" as const,
    sections: [section],
  };
  if (existing) await payload.update({ collection: "pages", id: existing.id, data: { ...data, deletedAt: null } as never, trash: true });
  else await payload.create({ collection: "pages", data: data as never });
  console.log(`${t.slug}: ${features.length} systems, ${stats.length} numbers, ${section.interiorPhotos.length}+${section.exteriorPhotos.length} photos, ${buildIds.length} builds`);
}
process.exit(0);
