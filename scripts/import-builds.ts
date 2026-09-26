/**
 * One-time move of the 115 finished builds into the CMS (Content > Builds).
 *
 *   npx tsx scripts/import-builds.ts
 *
 * Photos come from the full-size originals on papagovans.com rather than the
 * compressed copies in public/projects, so each one is compressed exactly
 * once, by the Media Library, at the measured settings in collections/Media.ts.
 * Order matches the old site: the featured image first, then upload order.
 *
 * The same photo twice on one build (19 cases on the old site) is kept once.
 * The same photo on two different builds is stored once and used by both;
 * that is left for the shop to sort out, not guessed at here.
 *
 * Safe to re-run: builds match on slug, photos on filename.
 *
 * --local skips papagovans.com and uses the copies in public/projects. The
 * live site's Cloudflare protection began challenging these requests part way
 * through the first run, and a challenge is not something to work around, so
 * the last 48 builds came from the local copies. Measured against the
 * originals they score 0.957 SSIM, above the 0.950 the old site served, but
 * below the 0.971 the originals give. Re-import those from originals later
 * by deleting the build in /admin and running this without --local.
 */
import { createHash } from "crypto";
import { createRequire } from "module";
import { readdir, readFile } from "fs/promises";
import path from "path";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { JSDOM } = await import("jsdom");
const { getPayload } = await import("payload");
const { convertHTMLToLexical, editorConfigFactory } = await import("@payloadcms/richtext-lexical");
const { default: config } = await import("../payload.config.ts");
const { answerText } = await import("../collections/fields.ts");

const ROOT = process.cwd();
const LIVE = "https://papagovans.com";
const UA = { headers: { "user-agent": "Mozilla/5.0 (Macintosh) Chrome/130" } };
const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.fromEditor({ config: payload.config, editor: answerText });

type Shot = { md_webp: string; lg_webp?: string; alt: string };
type Legacy = { slug: string; title: string; date: string; excerpt: string; body: string[]; gallery: Shot[] };

const json = async (u: string) => (await fetch(u, UA)).json();
const LOCAL = process.argv.includes("--local");
const posts: { id: number; link: string; featured_media: number }[] = [];
for (let page = 1; !LOCAL; page++) {
  const batch = await json(`${LIVE}/wp-json/wp/v2/projects?per_page=100&page=${page}&_fields=id,link,featured_media`);
  if (!Array.isArray(batch) || !batch.length) break;
  posts.push(...batch);
}
const byPath = new Map(posts.map((p) => [new URL(p.link).pathname.replace(/^\/projects\/|\/$/g, ""), p]));

const byHash = new Map<string, number>();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let done = 0;
const notes: string[] = [];

/* The live site occasionally answers with a page instead of the photo (a
   throttle or a one-off error). Retry, then fall back to the site's own
   copy of that photo rather than stopping or saving the page as an image. */
async function download(url: string, shot: Shot, slug: string): Promise<Buffer> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(url, UA).catch(() => null);
    if (r?.ok && r.headers.get("content-type")?.startsWith("image/")) return Buffer.from(await r.arrayBuffer());
    await new Promise((res) => setTimeout(res, 2000 * attempt));
  }
  notes.push(`${slug}: ${url.split("/").pop()} would not download, used the site's own copy`);
  fallbacks.add(url);
  return readFile(path.join(ROOT, "public", shot.lg_webp ?? shot.md_webp));
}
const fallbacks = new Set<string>();

async function photo(data: Buffer, name: string, alt: string, mimetype: string) {
  const hash = createHash("sha1").update(data).digest("hex");
  if (byHash.has(hash)) return { id: byHash.get(hash)!, hash };
  const found = await payload.find({ collection: "media", where: { filename: { equals: `${name}.webp` } }, limit: 1 });
  const id = found.docs[0]?.id ?? (await payload.create({
    collection: "media",
    data: { alt },
    file: { data, name: `${name}.${mimetype.split("/")[1].replace("jpeg", "jpg")}`, mimetype, size: data.length },
  })).id;
  byHash.set(hash, id as number);
  return { id: id as number, hash };
}

/* A few builds have no excerpt on the old site. Their own first paragraph
   stands in, cut at a sentence or a word, never invented copy. */
function summaryOf(b: Legacy) {
  if (b.excerpt.trim()) return b.excerpt.slice(0, 320);
  const first = b.body[0] ?? b.title;
  notes.push(`${b.slug}: no summary on the old site, used the start of its write-up`);
  if (first.length <= 300) return first;
  const cut = first.slice(0, 300);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return end > 120 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

async function one(file: string) {
  const b: Legacy = JSON.parse(await readFile(path.join(ROOT, "content/projects", file), "utf8"));
  // A build is only created once all its photos are in, so one that exists is done.
  const already = await payload.find({ collection: "builds", where: { slug: { equals: b.slug } }, limit: 1, depth: 0 });
  if (already.docs[0]) return void console.log(`  [${++done}/115] ${b.slug}: already imported`);
  const post = byPath.get(b.slug);
  let sources: { get: () => Promise<Buffer>; mimetype: string }[] = [];
  if (post) {
    const media = (await json(`${LIVE}/wp-json/wp/v2/media?parent=${post.id}&per_page=100&_fields=id,source_url,mime_type`))
      .filter((m: { mime_type?: string }) => /^image\//.test(m.mime_type ?? ""));
    media.sort((x: { id: number }, y: { id: number }) => Number(y.id === post.featured_media) - Number(x.id === post.featured_media));
    if (media.length === b.gallery.length)
      sources = media.map((m: { source_url: string; mime_type: string }, i: number) => ({
        get: () => download(m.source_url, b.gallery[i], b.slug),
        mimetype: m.mime_type,
      }));
  }
  if (!sources.length && b.gallery.length) {
    notes.push(`${b.slug}: ${LOCAL ? "local copies (--local)" : "originals did not line up with the page, used the site's own copies"}`);
    sources = b.gallery.map((s) => ({ get: () => readFile(path.join(ROOT, "public", s.lg_webp ?? s.md_webp)), mimetype: "image/webp" }));
  }

  const ids: number[] = [];
  const seen = new Set<string>();
  for (const [i, src] of sources.entries()) {
    const data = await src.get();
    const isWebp = data.subarray(8, 12).toString() === "WEBP";
    const { id, hash } = await photo(data, `build-${b.slug}-${String(i).padStart(2, "0")}`.slice(0, 120), b.gallery[i].alt, isWebp ? "image/webp" : src.mimetype);
    if (seen.has(hash)) continue;
    seen.add(hash);
    ids.push(id);
  }

  const data = {
    title: b.title,
    slug: b.slug,
    finished: b.date,
    summary: summaryOf(b),
    description: b.body.length
      ? convertHTMLToLexical({ editorConfig, html: b.body.map((p) => `<p>${esc(p)}</p>`).join(""), JSDOM })
      : undefined,
    photos: ids,
    _status: "published" as const,
  };
  const existing = await payload.find({ collection: "builds", where: { slug: { equals: b.slug } }, limit: 1 });
  if (existing.docs[0]) await payload.update({ collection: "builds", id: existing.docs[0].id, data });
  else await payload.create({ collection: "builds", data });
  console.log(`  [${++done}/115] ${b.slug}: ${ids.length} photos${ids.length < b.gallery.length ? ` (${b.gallery.length - ids.length} repeats dropped)` : ""}`);
}

const files = (await readdir(path.join(ROOT, "content/projects"))).filter((f) => f.endsWith(".json")).sort();
const queue = [...files];
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let f; (f = queue.shift()); ) await one(f);
}));
console.log(`done: ${done} builds, ${byHash.size} photos stored`);
for (const n of notes) console.log(`  note: ${n}`);
process.exit(0);
