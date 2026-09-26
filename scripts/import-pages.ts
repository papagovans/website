/**
 * One-time move of the site's pages into the CMS.
 *
 *   npx tsx scripts/import-pages.ts [https://stage.papagovans.com]
 *
 * Two sources:
 *
 *   1. The six hand-built pages (FAQ, Our Process, Service, Financing,
 *      Careers, Contact) are read off the running site and taken apart into
 *      sections by their markup: .cards become Cards, ol.steps becomes
 *      Numbered Steps, and so on. Nothing is retyped, so nothing is mistyped.
 *   2. The eleven pages still served from content/pages (floor plans, van
 *      types, legal) become a single Text section each, with their photos
 *      moved into the Media Library.
 *
 * Already run. content/pages and public/content were removed afterwards, so
 * the CMS is the only copy; both are in git history if ever needed.
 *
 * Safe to re-run: pages match on slug and are replaced, images on filename.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());

const { JSDOM } = await import("jsdom");
const { getPayload } = await import("payload");
const { convertHTMLToLexical, editorConfigFactory } = await import("@payloadcms/richtext-lexical");
const { default: config } = await import("../payload.config.ts");
const { editor } = await import("../collections/editor.ts");
const { shortText, answerText } = await import("../collections/fields.ts");
const { DESTINATIONS } = await import("../lib/site.ts");

const BASE = process.argv[2] ?? "https://stage.papagovans.com";
const ROOT = process.cwd();
const payload = await getPayload({ config });
const cfg = {
  full: await editorConfigFactory.fromEditor({ config: payload.config, editor }),
  short: await editorConfigFactory.fromEditor({ config: payload.config, editor: shortText }),
  answer: await editorConfigFactory.fromEditor({ config: payload.config, editor: answerText }),
};

type Node = { type?: string; value?: unknown; children?: Node[] };
function lexical(html: string, kind: keyof typeof cfg) {
  const state = convertHTMLToLexical({ editorConfig: cfg[kind], html, JSDOM });
  const walk = (n: Node) => {
    if (n.type === "upload" && typeof n.value === "string") n.value = Number(n.value);
    n.children?.forEach(walk);
  };
  walk(state.root as Node);
  return state;
}

/* A link on the page becomes a named destination when it is one we know. */
function destination(a: Element | null) {
  if (!a) return undefined;
  const href = a.getAttribute("href") ?? "";
  const text = (a.textContent ?? "").replace(/\s+/g, " ").replace("⊕", "").trim();
  const hit = Object.entries(DESTINATIONS).find(([, d]) => d.href === href);
  if (!hit) return { to: "custom", url: href, text };
  const [to, d] = hit;
  return { to, text: text === d.text || to === "map" ? undefined : text };
}

const clean = (html: string) => html.replace(/\s+/g, " ").trim();

async function fromLivePage(slug: string) {
  const html = await (await fetch(`${BASE}/${slug}/`)).text();
  const doc = new JSDOM(html).window.document;
  const q = (s: string) => doc.querySelector(s);
  const sections: Record<string, unknown>[] = [];
  let heading: string | undefined;
  const take = () => { const h = heading; heading = undefined; return h; };

  const body = q(".page-body .wrap")!;
  for (const el of [...body.children]) {
    const c = el.classList;
    if (el.tagName === "H2" && c.contains("page-h2")) heading = el.textContent!.trim();
    else if (el.tagName === "P" && c.contains("page-p")) {
      const last = sections.at(-1);
      if (last?.blockType === "text" && !heading) last._html += el.outerHTML;
      else sections.push({ blockType: "text", heading: take(), _html: el.outerHTML });
    } else if (c.contains("cards"))
      sections.push({
        blockType: "cards",
        heading: take(),
        items: [...el.querySelectorAll(".card")].map((card) => ({
          title: card.querySelector("h2")!.textContent!.trim(),
          text: card.querySelector("p:not(.card-strong)")!.textContent!.replace(/\s+/g, " ").trim(),
          highlight: destination(card.querySelector(".card-strong a")),
        })),
      });
    else if (c.contains("steps"))
      sections.push({
        blockType: "steps",
        heading: take(),
        items: [...el.querySelectorAll(".step")].map((s) => ({
          title: s.querySelector("h2")!.textContent!.trim(),
          text: s.querySelector("p")!.textContent!.replace(/\s+/g, " ").trim(),
        })),
      });
    else if (c.contains("faq")) {
      const item = {
        question: el.querySelector("summary")!.textContent!.trim(),
        answer: lexical(clean(el.querySelector(".faq-answer")!.innerHTML), "answer"),
      };
      const last = sections.at(-1);
      if (last?.blockType === "faq") (last.items as unknown[]).push(item);
      else sections.push({ blockType: "faq", heading: take(), items: [item] });
    } else if (c.contains("ticks"))
      sections.push({
        blockType: "checklist",
        heading: take(),
        items: [...el.querySelectorAll("li")].map((li) => ({ text: lexical(`<p>${clean(li.innerHTML)}</p>`, "short") })),
      });
    else if (c.contains("page-note")) sections.push({ blockType: "note", content: lexical(clean(el.innerHTML), "short") });
    else if (c.contains("page-cta")) {
      const alt = el.querySelector(".page-cta-alt");
      sections.push({
        blockType: "cta",
        heading: el.querySelector("h2")!.textContent!.trim(),
        text: el.querySelector(":scope > p:not(.page-cta-alt)")?.textContent?.replace(/\s+/g, " ").trim(),
        button: destination(el.querySelector("a.btn")),
        smallPrint: alt ? lexical(`<p>${clean(alt.innerHTML)}</p>`, "short") : undefined,
      });
    } else throw new Error(`${slug}: no section type for <${el.tagName.toLowerCase()} class="${el.className}">`);
  }

  for (const s of sections) if (s._html) { s.content = lexical(clean(s._html as string), "full"); delete s._html; }

  return {
    title: q(".page-eyebrow")?.textContent?.trim() ?? slug,
    eyebrow: q(".page-eyebrow")?.textContent?.trim(),
    heading: q(".page-head h1")!.textContent!.trim(),
    intro: q(".page-lede")?.textContent?.replace(/\s+/g, " ").trim(),
    seoTitle: doc.title,
    seoDescription: q('meta[name="description"]')?.getAttribute("content") ?? undefined,
    sections,
  };
}

const mediaIds = new Map<string, number | string>();
async function mediaFor(src: string, alt: string, slug: string) {
  const name = `${slug}-${path.basename(src).replace(/\.[^.]+$/, "")}`.slice(0, 120);
  if (mediaIds.has(name)) return mediaIds.get(name)!;
  const found = await payload.find({ collection: "media", where: { filename: { equals: `${name}.webp` } }, limit: 1 });
  let id = found.docs[0]?.id;
  if (!id) {
    const data = await readFile(path.join(ROOT, "public", decodeURI(src)));
    id = (await payload.create({
      collection: "media",
      data: { alt: alt || slug.replace(/-/g, " ") },
      file: { data, name: `${name}${path.extname(src)}`, mimetype: `image/${path.extname(src).slice(1).replace("jpg", "jpeg")}`, size: data.length },
    })).id;
  }
  mediaIds.set(name, id);
  return id;
}

async function fromLegacyJson(slug: string) {
  const legacy = JSON.parse(await readFile(path.join(ROOT, "content", "pages", `${slug}.json`), "utf8"));
  const doc = new JSDOM(legacy.body).window.document;
  for (const img of [...doc.querySelectorAll("img")]) {
    const src = img.getAttribute("src") ?? "";
    if (!src.startsWith("/")) throw new Error(`${slug}: external image ${src}`);
    img.setAttribute("data-lexical-upload-relation-to", "media");
    img.setAttribute("data-lexical-upload-id", String(await mediaFor(src, img.getAttribute("alt") ?? "", slug)));
  }
  for (const a of [...doc.querySelectorAll("a:not([href])")]) a.replaceWith(...a.childNodes);
  for (const a of [...doc.querySelectorAll("a[href]")]) {
    const href = a.getAttribute("href")!;
    if (!/^(https?:|mailto:|tel:|\/|#)/.test(href)) a.setAttribute("href", `https://${href}`);
  }
  for (const fig of [...doc.querySelectorAll("figure")]) fig.replaceWith(...fig.childNodes);
  return {
    title: legacy.title,
    heading: legacy.title,
    seoTitle: legacy.seoTitle ?? undefined,
    seoDescription: legacy.description || undefined,
    sections: [{ blockType: "text", content: lexical(doc.body.innerHTML, "full") }],
  };
}

const LIVE = ["faq", "our-process", "service-department", "financing", "work-at-papago-vans", "contact-us"];
const LEGACY = [
  "el-capitan-luxury-van-build", "zion", "mammoth", "olympus", "rainier",
  "ford-transit", "mercedes-sprinter", "ram-promaster",
  "privacy-policy", "terms-conditions", "ccpa",
];

for (const slug of [...LIVE, ...LEGACY]) {
  const data = { ...(LIVE.includes(slug) ? await fromLivePage(slug) : await fromLegacyJson(slug)), slug, _status: "published" as const };
  const existing = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1 });
  if (existing.docs[0]) await payload.update({ collection: "pages", id: existing.docs[0].id, data: data as never });
  else await payload.create({ collection: "pages", data: data as never });
  console.log(`  ${slug}: ${data.sections.map((s) => s.blockType).join(", ")}`);
}
console.log(`${LIVE.length + LEGACY.length} pages, ${mediaIds.size} images`);
process.exit(0);
