/*
 * Pulls blog posts and standalone pages out of WordPress into this repo.
 *
 * Projects were simple: a title, some paragraphs, a pile of photos. These are
 * Elementor documents, so the job is to keep the semantic HTML (headings,
 * lists, links, emphasis) and throw away the builder's scaffolding, then
 * rewrite every image to a local compressed copy.
 *
 *   node scripts/pull-pages.mjs posts custom-camper-van-build-cost-2025-guide
 *   node scripts/pull-pages.mjs pages faq about-us
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const LIVE = "https://papagovans.com";

const json = async (url) => {
  const t = (await (await fetch(url)).text()).trim();
  if (t.startsWith("[") || t.startsWith("{")) return JSON.parse(t);
  const a = t.indexOf("["), o = t.indexOf("{");
  const start = a === -1 ? o : o === -1 ? a : Math.min(a, o);
  return JSON.parse(t.slice(start, Math.max(t.lastIndexOf("]"), t.lastIndexOf("}")) + 1));
};

const entities = (s = "") =>
  s.replace(/&#8217;|&#0?39;|&rsquo;|&lsquo;/g, "'")
   .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
   .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, " ")
   .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Keep meaning, drop the page builder. */
const ALLOWED = /^(p|h2|h3|h4|ul|ol|li|strong|em|b|i|a|br|blockquote|figure|figcaption)$/i;

function clean(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(div|section|span|header|footer|nav|aside)\b[^>]*>/gi, "")
    .replace(/<\/(div|section|span|header|footer|nav|aside)>/gi, "");
  /* Strip every attribute except href on links, so Elementor's class soup and
   * inline styles do not come along. Images are handled separately. */
  s = s.replace(/<([a-z0-9]+)\b([^>]*)>/gi, (m, tag, attrs) => {
    if (/^img$/i.test(tag)) return m;
    if (!ALLOWED.test(tag)) return "";
    const href = /^a$/i.test(tag) ? (attrs.match(/href="([^"]*)"/i) ?? [])[1] : null;
    return href ? `<a href="${href}">` : `<${tag}>`;
  });
  s = s.replace(/<\/([a-z0-9]+)>/gi, (m, tag) => (ALLOWED.test(tag) ? m : ""));
  return s.replace(/\n{3,}/g, "\n\n").replace(/(<p>\s*<\/p>)+/g, "").trim();
}

async function pull(type, slug) {
  const [doc] = await json(
    `${LIVE}/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug,link,title,date,modified,content,excerpt,yoast_head_json`,
  );
  if (!doc) return console.log(`  ${slug}: not found`);

  const imgDir = join(process.cwd(), "public", "content", slug);
  await mkdir(imgDir, { recursive: true });

  let html = doc.content?.rendered ?? "";
  const srcs = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]))]
    .filter((u) => /^https?:\/\//.test(u) && !/lyteCache|\.svg/i.test(u));

  let srcBytes = 0, outBytes = 0, n = 0;
  for (const [i, url] of srcs.entries()) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      srcBytes += buf.length;
      const base = `${String(i).padStart(2, "0")}`;
      const out = await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 }).toBuffer();
      await writeFile(join(imgDir, `${base}.webp`), out);
      outBytes += out.length;
      /* Point every reference at the local copy, whatever size variant the
       * original markup asked for. */
      html = html.split(url).join(`/content/${slug}/${base}.webp`);
      n++;
    } catch {}
  }

  const y = doc.yoast_head_json ?? {};
  const body = clean(html)
    .replace(/<img([^>]*)>/gi, (m, attrs) => {
      const src = (attrs.match(/src="([^"]*)"/i) ?? [])[1];
      const alt = entities((attrs.match(/alt="([^"]*)"/i) ?? [])[1] ?? "");
      return src?.startsWith("/content/") ? `<img src="${src}" alt="${alt}" loading="lazy" />` : "";
    });

  const finalBody = entities(body)
    /* Internal links become relative, so they keep the reader on the new site
     * instead of bouncing them to the WordPress one we are replacing. */
    .replace(/href="https?:\/\/(?:www\.)?papagovans\.com(\/[^"]*)?"/gi, (_, path) => `href="${path || "/"}"`);

  const out = {
    type, slug,
    path: new URL(doc.link).pathname,
    title: entities(doc.title?.rendered ?? ""),
    date: doc.date?.slice(0, 10) ?? null,
    seoTitle: y.title ?? null,
    description: entities(y.og_description ?? y.description ?? "").slice(0, 300),
    body: finalBody,
  };
  await mkdir(join(process.cwd(), "content", "pages"), { recursive: true });
  await writeFile(join(process.cwd(), "content", "pages", `${slug}.json`), JSON.stringify(out, null, 2) + "\n");

  const words = finalBody.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(
    `  ${slug.slice(0, 44).padEnd(46)} ${String(words).padStart(5)} words  ${String(n).padStart(2)} imgs  ` +
    `${(srcBytes / 1048576).toFixed(1)}MB -> ${(outBytes / 1048576).toFixed(2)}MB`,
  );
}

const [type, ...slugs] = process.argv.slice(2);
if (!type || !slugs.length) {
  console.error("usage: pull-pages.mjs <posts|pages> <slug...>");
  process.exit(1);
}
console.log(`pulling ${slugs.length} ${type}`);
for (const s of slugs) await pull(type, s);
