/**
 * One-time move of the four designed pages (Home, About, Bespoke, the Build
 * Gallery) and the team roster into the CMS.
 *
 *   npx tsx scripts/import-designed-pages.ts [https://stage.papagovans.com]
 *
 * Read off the running site, so nothing is retyped. The team comes from
 * content/team.json, portraits from public/team. Already run: those files
 * and the four page folders were removed afterwards and are in git history.
 * Safe to re-run: pages match on slug, people on name, images on filename.
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
const { shortText } = await import("../collections/fields.ts");
const { DEPARTMENTS } = await import("../collections/Team.ts");
const { DESTINATIONS } = await import("../lib/site.ts");

const BASE = process.argv[2] ?? "https://stage.papagovans.com";
const ROOT = process.cwd();
const payload = await getPayload({ config });
const cfg = {
  full: await editorConfigFactory.fromEditor({ config: payload.config, editor }),
  short: await editorConfigFactory.fromEditor({ config: payload.config, editor: shortText }),
};
const lexical = (html: string, kind: keyof typeof cfg = "short") =>
  convertHTMLToLexical({ editorConfig: cfg[kind], html: html.replace(/\s+/g, " ").trim(), JSDOM });
const txt = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").replace("⊕", "").trim();

function destination(a: Element | null | undefined) {
  if (!a) return undefined;
  const href = a.getAttribute("href") ?? "";
  const text = txt(a);
  const hit = Object.entries(DESTINATIONS).find(([, d]) => d.href === href);
  if (!hit) return { to: "custom", url: href, text };
  return { to: hit[0], text: text === hit[1].text ? undefined : text };
}

/* Upload a file from /public once, under a name that says what it is. */
async function mediaFor(publicPath: string, alt: string, name: string) {
  const found = await payload.find({ collection: "media", where: { filename: { equals: `${name}.webp` } }, limit: 1 });
  if (found.docs[0]) return found.docs[0].id;
  const data = await readFile(path.join(ROOT, "public", publicPath));
  const ext = path.extname(publicPath).slice(1);
  return (await payload.create({
    collection: "media",
    data: { alt },
    file: { data, name: `${name}.${ext}`, mimetype: `image/${ext}`, size: data.length },
  })).id;
}
/* The largest file behind a <picture>: avif and webp siblings share a stem. */
const imgOf = (root: Element) => root.querySelector("img")!;

async function page(slug: string) {
  const html = await (await fetch(`${BASE}/${slug}${slug ? "/" : ""}`)).text();
  return new JSDOM(html).window.document;
}

/* ---- Home -------------------------------------------------------------- */
async function home() {
  const d = await page("");
  const sections: Record<string, unknown>[] = [];

  const hero = d.querySelector(".hero-full")!;
  sections.push({
    blockType: "hero",
    image: await mediaFor("home/hero-xl.avif", imgOf(hero).alt, "home-hero"),
    heading: hero.querySelector("h1")!.innerHTML.split(/<br\s*\/?>/).map((l) => l.trim()).join("\n"),
    text: txt(hero.querySelector(".hero-full-inner > p")),
    button: destination(hero.querySelector(".btn-gold")),
    secondButton: destination(hero.querySelector(".btn-ghost")),
  });

  for (const sec of d.querySelectorAll("body > * section, main > section, section")) {
    if (sec.parentElement?.closest("section")) continue;
    const c = sec.classList;
    if (c.contains("paths"))
      sections.push({
        blockType: "pathCards",
        heading: txt(sec.querySelector("h2")),
        intro: txt(sec.querySelector(".section-lede")),
        anchor: sec.id || undefined,
        items: [...sec.querySelectorAll(".path-card")].map((p) => ({
          title: txt(p.querySelector(".path-name")),
          kicker: txt(p.querySelector(".path-kicker")),
          text: txt(p.querySelector(".path-copy")),
          priceLabel: txt(p.querySelector(".path-range-label")),
          price: txt(p.querySelector(".path-range")),
          button: destination(p.querySelector("a.btn")),
          featured: p.classList.contains("is-featured"),
          flag: txt(p.querySelector(".path-flag")) || undefined,
        })),
      });
    else if (c.contains("explore"))
      sections.push({ blockType: "vanTour", heading: txt(sec.querySelector("h2")), intro: txt(sec.querySelector(".section-lede")) });
    else if (c.contains("scene")) {
      const img = imgOf(sec);
      const src = img.getAttribute("src")!.replace(/^\//, "");
      sections.push({
        blockType: "imageText",
        image: await mediaFor(src, img.alt, `home-${sec.id}`),
        imageSide: c.contains("is-flipped") ? "right" : "left",
        eyebrow: txt(sec.querySelector(".scene-eyebrow")),
        heading: txt(sec.querySelector(".scene-copy h2")),
        subheading: txt(sec.querySelector(".scene-sub")),
        content: lexical([...sec.querySelectorAll(".scene-copy p:not(.scene-eyebrow):not(.scene-sub)")].map((p) => p.outerHTML).join("")),
      });
    } else if (c.contains("collage")) {
      const feats = [];
      for (const [i, f] of [...sec.querySelectorAll("[class^=collage-feature]")].entries()) {
        const img = imgOf(f);
        feats.push(await mediaFor(img.getAttribute("src")!.replace(/^\//, ""), img.alt, `home-collage-${i + 1}`));
      }
      sections.push({
        blockType: "photoWall",
        heading: txt(sec.querySelector("h2")),
        text: txt(sec.querySelector(".collage-head p")).replace(/^\d+ /, "{builds} "),
        button: destination(sec.querySelector(".collage-head a.btn")),
        featured: feats,
      });
    } else if (c.contains("reviews"))
      sections.push({
        blockType: "testimonials",
        heading: txt(sec.querySelector("h2")),
        intro: txt(sec.querySelector(".section-lede")),
        items: [...sec.querySelectorAll("blockquote.review:not([aria-hidden])")].map((r) => ({
          quote: txt(r.querySelector("p")),
          name: txt(r.querySelector("cite")),
        })),
      });
    else if (!["hero-full", "keep-in-touch", "journey"].some((k) => c.contains(k))) console.log(`  home: skipped <section class="${sec.className}">`);
    if (c.contains("journey"))
      sections.push({
        blockType: "cta",
        style: "band",
        eyebrow: txt(sec.querySelector(".journey-eyebrow")),
        heading: txt(sec.querySelector("h2")),
        text: txt(sec.querySelector(".journey-inner > p:not(.journey-eyebrow):not(.journey-alt)")),
        button: destination(sec.querySelector("a.btn")),
        smallPrint: lexical(`<p>${sec.querySelector(".journey-alt")!.innerHTML}</p>`),
      });
  }
  return { title: "Home", sections };
}

/* ---- About ------------------------------------------------------------- */
async function about() {
  const d = await page("about-us");
  const src = await readFile(path.join(ROOT, "app/(frontend)/about-us/page.tsx"), "utf8");
  const provisional = new Set([...src.matchAll(/when:\s*"([^"]+)",\s*\n\s*provisional:\s*true/g)].map((m) => m[1]));
  const sections: Record<string, unknown>[] = [];

  const why = d.querySelector(".about-shop")!;
  const shot = why.querySelector(".why-team")!;
  sections.push({
    blockType: "imageText",
    image: await mediaFor("shop/team-lg.webp", imgOf(shot).alt, "about-shop-crew"),
    imageSide: "right",
    caption: txt(shot.querySelector("figcaption")),
    eyebrow: txt(why.querySelector(".why-eyebrow")),
    heading: txt(why.querySelector("h2")),
    content: lexical([...why.querySelectorAll(".why-copy > p:not(.why-eyebrow)")].map((p) => p.outerHTML).join("")),
    button: destination(why.querySelector(".why-copy a.btn")),
  });

  let heading: string | undefined;
  for (const el of d.querySelector(".page-body .wrap")!.children) {
    const c = el.classList;
    if (el.tagName === "H2") heading = txt(el);
    else if (c.contains("cards"))
      sections.push({
        blockType: "cards",
        heading,
        items: [...el.querySelectorAll(".card")].map((k) => ({ title: txt(k.querySelector("h2")), text: txt(k.querySelector("p")) })),
      }), (heading = undefined);
    else if (c.contains("page-p")) {
      const last = sections.at(-1)!;
      if (heading === "Meet The Team")
        sections.push({ blockType: "team", heading, intro: txt(el).replace(/^\d+ /, "{team} ") }), (heading = undefined);
      else if (last.blockType === "text" && !heading) last._html += el.outerHTML;
      else sections.push({ blockType: "text", heading, _html: el.outerHTML }), (heading = undefined);
    } else if (c.contains("team-group") || c.contains("team-row")) continue;
    else if (c.contains("page-note")) sections.push({ blockType: "note", content: lexical(el.innerHTML) });
    else if (c.contains("timeline"))
      sections.push({
        blockType: "timeline",
        heading,
        items: [...el.querySelectorAll(".milestone")].map((m) => ({
          when: txt(m.querySelector(".milestone-when")),
          title: txt(m.querySelector("h3")),
          text: txt(m.querySelector(".milestone-body p")),
          provisional: provisional.has(txt(m.querySelector(".milestone-when"))),
        })),
      }), (heading = undefined);
    else if (c.contains("page-cta"))
      sections.push({
        blockType: "cta",
        style: "box",
        heading: txt(el.querySelector("h2")),
        text: txt(el.querySelector(":scope > p")),
        button: destination(el.querySelector("a.btn")),
      });
    else throw new Error(`about: no section type for <${el.tagName.toLowerCase()} class="${el.className}">`);
  }
  for (const s of sections) if (s._html) (s.content = lexical(s._html as string, "full")), delete s._html;

  return {
    title: "About Us",
    eyebrow: txt(d.querySelector(".page-eyebrow")),
    heading: txt(d.querySelector(".page-head h1")),
    intro: txt(d.querySelector(".page-lede")),
    seoTitle: d.title,
    seoDescription: d.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined,
    sections,
  };
}

/* ---- Bespoke ----------------------------------------------------------- */
async function bespoke() {
  const d = await page("bespoke");
  const cta = d.querySelector(".bsp-cta")!;
  return {
    title: "Bespoke",
    eyebrow: txt(d.querySelector(".bsp-eyebrow")),
    heading: txt(d.querySelector(".bsp h1")),
    intro: txt(d.querySelector(".bsp-lede")),
    seoTitle: d.title,
    seoDescription: d.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined,
    sections: [
      {
        blockType: "cards",
        items: [...d.querySelectorAll(".bsp-card")].map((k) => ({ title: txt(k.querySelector("h3")), text: txt(k.querySelector("p")) })),
      },
      {
        blockType: "priceBox",
        heading: txt(d.querySelector(".bsp-price h2")),
        price: txt(d.querySelector(".bsp-figure")).replace("–", "-"),
        note: txt(d.querySelector(".bsp-note")),
        items: [...d.querySelectorAll(".bsp-drivers li")].map((li) => ({ title: txt(li.querySelector("b")), text: txt(li.querySelector("span")) })),
      },
      {
        blockType: "cta",
        style: "box",
        button: destination(cta.querySelector(".btn-gold")),
        secondButton: destination(cta.querySelector(".btn-outline")),
        smallPrint: lexical(`<p>${txt(cta.querySelector(".muted"))}</p>`),
      },
    ],
  };
}

/* ---- Gallery ----------------------------------------------------------- */
async function gallery() {
  const d = await page("van-life-build-gallery");
  return {
    title: "Build Gallery",
    eyebrow: txt(d.querySelector(".gal-eyebrow")),
    heading: txt(d.querySelector(".gal h1")),
    intro: txt(d.querySelector(".gal-lede")).replace(/^\d+ /, "{builds} "),
    seoTitle: d.title,
    seoDescription: d.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined,
    sections: [{ blockType: "buildGallery" }],
  };
}

/* ---- Team -------------------------------------------------------------- */
type Member = { dept: string; name: string; role: string; slug: string };
const roster: Member[] = JSON.parse(await readFile(path.join(ROOT, "content/team.json"), "utf8"));
roster.sort((a, b) => DEPARTMENTS.indexOf(a.dept as never) - DEPARTMENTS.indexOf(b.dept as never));
for (const m of roster) {
  if (!DEPARTMENTS.includes(m.dept as never)) throw new Error(`Unknown department ${m.dept}`);
  const photo = await mediaFor(`team/${m.slug}.webp`, `${m.name}, ${m.role} at Papago Vans`, `team-${m.slug}`);
  const data = { name: m.name, role: m.role, department: m.dept as never, photo };
  const found = await payload.find({ collection: "team", where: { name: { equals: m.name }, role: { equals: m.role } }, limit: 1 });
  if (found.docs[0]) await payload.update({ collection: "team", id: found.docs[0].id, data });
  else await payload.create({ collection: "team", data });
}
console.log(`${roster.length} team members`);

const PAGES: [string, () => Promise<Record<string, unknown>>][] = [
  ["home", home], ["about-us", about], ["bespoke", bespoke], ["van-life-build-gallery", gallery],
];
for (const [slug, build] of PAGES) {
  const data = { ...(await build()), slug, _status: "published" as const };
  const existing = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1 });
  if (existing.docs[0]) await payload.update({ collection: "pages", id: existing.docs[0].id, data: data as never });
  else await payload.create({ collection: "pages", data: data as never });
  console.log(`  ${slug}: ${(data.sections as { blockType: string }[]).map((s) => s.blockType).join(", ")}`);
}
process.exit(0);
