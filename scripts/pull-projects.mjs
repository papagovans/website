/*
 * Pulls project galleries out of the live WordPress site and lands them in this
 * repo as content + pre-compressed images.
 *
 * The live site ships 60-megapixel camera exports straight to the browser, some
 * over 11 MB. Everything here is resized and re-encoded at extract time rather
 * than at request time, so the pages cost nothing to serve and we never pay for
 * runtime image optimisation across 114 galleries.
 *
 *   node scripts/pull-projects.mjs tailgate-titan dually-deluxe-camper
 *   node scripts/pull-projects.mjs --all
 */
import { mkdir, writeFile, readdir } from "node:fs/promises";
import sharp from "sharp";

const LIVE = "https://papagovans.com";
const OUT_IMG = new URL("../public/projects/", import.meta.url);
const OUT_DOC = new URL("../content/projects/", import.meta.url);

/* Elementor echoes render output ahead of the JSON body on list endpoints, so
 * the payload has to be located rather than parsed from byte zero. */
const json = async (url) => {
  const t = (await (await fetch(url)).text()).trim();
  if (t.startsWith("[") || t.startsWith("{")) return JSON.parse(t);
  /* Trailing bytes are whitespace, so the last bracket is the real terminator. */
  const a = t.indexOf("["), o = t.indexOf("{");
  const start = a === -1 ? o : o === -1 ? a : Math.min(a, o);
  const end = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
  return JSON.parse(t.slice(start, end + 1));
};

const clean = (s = "") =>
  s.replace(/&#8243;/g, '"').replace(/&#8217;|&#0?39;/g, "'").replace(/&amp;/g, "&")
   .replace(/&nbsp;/g, " ").replace(/&#\d+;/g, " ").trim();

const SIZES = [
  { w: 1600, suffix: "lg" },
  { w: 800, suffix: "md" },
];

async function pullOne(slug) {
  const [post] = await json(`${LIVE}/wp-json/wp/v2/projects?slug=${slug}&_fields=id,slug,title,link,content,excerpt,featured_media,date`);
  if (!post) return console.log(`  ${slug}: not found`);

  const media = await json(`${LIVE}/wp-json/wp/v2/media?parent=${post.id}&per_page=100&_fields=id,source_url,alt_text,media_details,mime_type`);
  const imgs = media.filter((m) => /^image\//.test(m.mime_type ?? ""));
  /* Featured first, then the shot order the shop uploaded in. */
  imgs.sort((a, b) => (b.id === post.featured_media) - (a.id === post.featured_media));

  const dir = new URL(`${slug}/`, OUT_IMG);
  await mkdir(dir, { recursive: true });

  let srcBytes = 0, outBytes = 0;
  const gallery = [];
  for (const [i, m] of imgs.entries()) {
    const buf = Buffer.from(await (await fetch(m.source_url)).arrayBuffer());
    srcBytes += buf.length;
    const base = `${String(i).padStart(2, "0")}`;
    const meta = await sharp(buf).metadata();
    const variants = {};
    for (const { w, suffix } of SIZES) {
      for (const fmt of ["avif", "webp"]) {
        const out = await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true })
          [fmt](fmt === "avif" ? { quality: 55 } : { quality: 78 }).toBuffer();
        await writeFile(new URL(`${base}-${suffix}.${fmt}`, dir), out);
        outBytes += out.length;
        variants[`${suffix}_${fmt}`] = `/projects/${slug}/${base}-${suffix}.${fmt}`;
      }
    }
    gallery.push({
      ...variants,
      alt: clean(m.alt_text) || clean(post.title?.rendered),
      portrait: (meta.height ?? 0) > (meta.width ?? 0),
    });
  }

  const html = post.content?.rendered ?? "";
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => clean(m[1].replace(/<[^>]+>/g, "")))
    .filter((p) => p.length > 60);

  const doc = {
    slug, path: new URL(post.link).pathname,
    title: clean(post.title?.rendered),
    date: post.date?.slice(0, 10) ?? null,
    excerpt: clean((post.excerpt?.rendered ?? "").replace(/<[^>]+>/g, "")).slice(0, 220),
    body: paras,
    gallery,
  };
  await mkdir(OUT_DOC, { recursive: true });
  await writeFile(new URL(`${slug}.json`, OUT_DOC), JSON.stringify(doc, null, 2) + "\n");

  const pct = srcBytes ? (100 - (outBytes / srcBytes) * 100).toFixed(1) : "0";
  console.log(`  ${slug.padEnd(28)} ${String(imgs.length).padStart(3)} imgs  ${(srcBytes/1048576).toFixed(1).padStart(5)} MB -> ${(outBytes/1048576).toFixed(2).padStart(5)} MB  (-${pct}%)  ${paras.length} paras`);
}

let slugs = process.argv.slice(2);
if (slugs[0] === "--all") {
  slugs = [];
  for (let p = 1; ; p++) {
    const rows = await json(`${LIVE}/wp-json/wp/v2/projects?per_page=100&page=${p}&_fields=slug`);
    if (!rows.length) break;
    slugs.push(...rows.map((r) => r.slug));
    if (rows.length < 100) break;
  }
}
if (!slugs.length) { console.error("usage: pull-projects.mjs <slug...> | --all"); process.exit(1); }
console.log(`pulling ${slugs.length} project(s)`);
for (const s of slugs) await pullOne(s);
