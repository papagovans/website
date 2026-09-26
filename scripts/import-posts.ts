/**
 * One-time move of the blog out of content/pages/*.json and into the CMS.
 *
 *   npx tsx scripts/import-posts.ts
 *
 * Already run. The 23 source files and their images were removed from
 * content/pages and public/content afterwards, so the CMS is the only copy
 * and nobody edits a JSON file expecting it to reach the site. They are in
 * git history (the commit before "Blog moves into the CMS") if ever needed.
 *
 * Safe to re-run: posts match on slug and are updated in place, images match
 * on filename and upload once. Every post lands published, with its original
 * date, Yoast title and meta description, so nothing Google sees changes.
 *
 * Images become real Media Library entries rather than <img> tags pointing at
 * /public, so an editor opening an old post sees photos she can swap, not
 * HTML she has to work around.
 */
import { createRequire } from "module";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Before payload.config evaluates, since it reads the connection string.
const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());

const { JSDOM } = await import("jsdom");
const { getPayload } = await import("payload");
const { convertHTMLToLexical, editorConfigFactory } = await import("@payloadcms/richtext-lexical");
const { default: config } = await import("../payload.config.ts");
const { editor } = await import("../collections/editor.ts");

const ROOT = process.cwd();
const PAGES = path.join(ROOT, "content", "pages");

type Legacy = {
  type: string; slug: string; title: string; date: string | null;
  seoTitle: string | null; description: string; body: string;
};

const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.fromEditor({ config: payload.config, editor });

/* Named after the post: every post's photos are 00.webp, 01.webp..., so the
   bare filename would hand one post another post's photos. Also reads better
   in the Media Library and in Google Images. */
const mediaIds = new Map<string, number | string>();
async function mediaFor(src: string, alt: string, slug: string) {
  const name = `${slug}-${path.basename(src).replace(/\.[^.]+$/, "")}`.slice(0, 120);
  if (mediaIds.has(name)) return mediaIds.get(name)!;
  const found = await payload.find({
    collection: "media",
    where: { filename: { equals: `${name}.webp` } },
    limit: 1,
  });
  let id = found.docs[0]?.id;
  if (!id) {
    const data = await readFile(path.join(ROOT, "public", decodeURI(src)));
    id = (
      await payload.create({
        collection: "media",
        data: { alt: alt || slug.replace(/-/g, " ") },
        file: { data, name: `${name}${path.extname(src)}`, mimetype: "image/webp", size: data.length },
      })
    ).id;
  }
  mediaIds.set(name, id);
  return id;
}

let posts = 0;
let images = 0;
for (const file of (await readdir(PAGES)).filter((f) => f.endsWith(".json"))) {
  const legacy: Legacy = JSON.parse(await readFile(path.join(PAGES, file), "utf8"));
  if (legacy.type !== "posts") continue;

  const dom = new JSDOM(legacy.body);
  const doc = dom.window.document;
  for (const img of [...doc.querySelectorAll("img")]) {
    const src = img.getAttribute("src") ?? "";
    if (!src.startsWith("/")) throw new Error(`${legacy.slug}: external image ${src}`);
    img.setAttribute("data-lexical-upload-relation-to", "media");
    img.setAttribute("data-lexical-upload-id", String(await mediaFor(src, img.getAttribute("alt") ?? "", legacy.slug)));
    images++;
  }
  // The editor only accepts real addresses. "iOverlander.com" was one that wasn't.
  // A link with no address (one button lost its href in the WordPress export) is just text.
  for (const a of [...doc.querySelectorAll("a:not([href])")]) a.replaceWith(...a.childNodes);
  for (const a of [...doc.querySelectorAll("a[href]")]) {
    const href = a.getAttribute("href")!.replace(/[?&]utm_[^#]*/, "");
    a.setAttribute("href", /^(https?:|mailto:|tel:|\/|#)/.test(href) ? href : `https://${href}`);
  }
  // The editor has no caption tool, so a caption becomes an italic line under the photo.
  for (const cap of [...doc.querySelectorAll("figcaption")]) {
    const p = doc.createElement("p");
    p.innerHTML = `<em>${cap.innerHTML}</em>`;
    cap.closest("figure")?.after(p);
    cap.remove();
  }
  // An <img> inside a <figure> must sit at the top level for Lexical.
  for (const fig of [...doc.querySelectorAll("figure")]) fig.replaceWith(...fig.childNodes);

  const body = convertHTMLToLexical({ editorConfig, html: doc.body.innerHTML, JSDOM });
  // The DOM hands ids over as strings; Postgres ids are numbers.
  const walk = (n: { type?: string; value?: unknown; children?: unknown[] }) => {
    if (n.type === "upload" && typeof n.value === "string") n.value = Number(n.value);
    (n.children as (typeof n)[] | undefined)?.forEach(walk);
  };
  walk(body.root as never);
  const data = {
    title: legacy.title,
    slug: legacy.slug,
    summary: legacy.description.slice(0, 320),
    seoTitle: legacy.seoTitle,
    publishedDate: legacy.date ?? new Date().toISOString(),
    body,
    _status: "published" as const,
  };

  const existing = await payload.find({ collection: "posts", where: {
      // An early run cut long slugs at 80 characters; find those too and repair them.
      or: [{ slug: { equals: legacy.slug } }, { slug: { equals: legacy.slug.slice(0, 80) } }],
    },
    limit: 1,
  });
  if (existing.docs[0]) await payload.update({ collection: "posts", id: existing.docs[0].id, data });
  else await payload.create({ collection: "posts", data });
  posts++;
  console.log(`  ${legacy.slug}`);
}

console.log(`${posts} posts, ${images} image references, ${mediaIds.size} images in the Media Library`);
process.exit(0);
