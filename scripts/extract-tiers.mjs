import { JSDOM } from "jsdom"; import fs from "fs";
const D = process.argv[2];
const css = fs.readdirSync(D).filter(f=>/^css\d+\.css$/.test(f)).map(f=>fs.readFileSync(`${D}/${f}`,"utf8")).join("\n");
const BG = {};
for (const m of css.matchAll(/\.elementor-(\d+) \.elementor-element\.elementor-element-([0-9a-f]+)(?::not\([^)]*\))?(?:,[^{]*)?\{[^}]*?background-image:url\("?([^")]+)/g)) BG[`${m[1]}:${m[2]}`] ??= m[3];
const f = u => u && u.replace(/.*wp-content\/uploads\//, "");
for (const slug of ["rainier","zion","olympus","mammoth","el-capitan-luxury-van-build"]) {
  const doc = new JSDOM(fs.readFileSync(`${D}/${slug}.html`,"utf8")).window.document;
  const root = doc.querySelector("[data-elementor-type=wp-page]"); const pid = root.getAttribute("data-elementor-id");
  const bg = e => { const id = e.getAttribute?.("data-id"); if (!id) return null; const doc_ = e.closest("[data-elementor-id]")?.getAttribute("data-elementor-id"); return f(BG[`${doc_}:${id}`]) || null; };
  const T = e => e ? e.textContent.replace(/\s+/g," ").trim() : null;
  const W = t => [...root.querySelectorAll(`[data-widget_type="${t}"]`)];
  const img = e => { const i = e.querySelector("img"); return i ? f(i.getAttribute("nitro-lazy-src")||i.getAttribute("data-src")||i.getAttribute("src")) : null; };
  const tablists = [...root.querySelectorAll(".e-n-tabs")].map(t => ({ titles: [...t.querySelectorAll(".e-n-tab-title")].map(T),
    panels: [...t.querySelectorAll("[role=tabpanel]")].map(p => ({ name: T(p.querySelector("h4,h3")), photo: [p, ...p.querySelectorAll("*")].map(bg).find(Boolean) || null, items: [...p.querySelectorAll("li")].map(T) })) }));
  const car = W("media-carousel.default").map(c => [...new Set([...c.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .elementor-carousel-image")].map(s => f(s.getAttribute("nitro-lazy-bg") || s.getAttribute("data-background") || "")).filter(Boolean))]);
  const sc = W("shortcode.default")[0];
  const pk = sc ? [...sc.querySelectorAll(".elementor-accordion-item")].map(a => ({ name: T(a.querySelector(".elementor-accordion-title")), desc: T(a.querySelector(".elementor-tab-content")) })) : [];
  const alc = sc ? [...sc.querySelectorAll(".elementor-tab-desktop-title")].map(t => ({ category: T(t), items: [...(doc.getElementById(t.getAttribute("aria-controls"))?.querySelectorAll("li") ?? [])].map(T) })) : [];
  const builds = [...root.querySelectorAll('[data-widget_type="premium-addon-blog.default"] .premium-blog-post-outer-container')].map(a => ({ title: T(a.querySelector("h2,h3")), href: a.querySelector("a")?.getAttribute("href") }));
  const out = { slug, title: T(doc.querySelector("title")), desc: doc.querySelector("meta[name=description]")?.getAttribute("content"),
    heads: W("heading.default").map(T), divider: W("divider.default").map(T), texts: W("text-editor.default").map(T),
    allBgs: [...root.querySelectorAll("[data-id]")].map(e => [e.getAttribute("data-id"), bg(e)]).filter(x => x[1]),
    counters: [...root.querySelectorAll(".elementor-counter")].map(c => [T(c.querySelector(".elementor-counter-title")), c.querySelector(".elementor-counter-number")?.getAttribute("data-to-value"), T(c.querySelector(".elementor-counter-number-suffix"))]),
    images: W("image.default").map(img), tablists, car, pk, alc, builds };
  fs.writeFileSync(`${D}/${slug}.json`, JSON.stringify(out, null, 1));
  console.log(slug, "tabs", tablists.map(t=>t.panels.length), "photos", tablists[0]?.panels.map(p=>!!p.photo).join(""), "car", car.map(c=>c.length), "pk", pk.length, "alc", alc.length, "builds", builds.length, "bgs", out.allBgs.length);
}
