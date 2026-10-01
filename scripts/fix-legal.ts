import { createRequire } from "module"; import fs from "fs"; const { loadEnvConfig } = createRequire(import.meta.url)("@next/env"); loadEnvConfig(process.cwd());
const { JSDOM } = await import("jsdom");
const { getPayload } = await import("payload"); const config = (await import("../payload.config")).default;
const payload = await getPayload({ config });
const DIR = process.env.DIR!;
const txt = (n:any):string => n.text ?? (n.children??[]).map(txt).join("");
const norm = (s:string) => s.replace(/\s+/g," ").trim().toLowerCase();
for (const slug of ["ccpa","privacy-policy","terms-conditions"]) {
  const doc = new JSDOM(fs.readFileSync(`${DIR}/${slug}.html`,"utf8")).window.document;
  const root = doc.querySelector("[data-elementor-type=wp-page]") ?? doc.body;
  const heads = new Set([...root.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h=>norm(h.textContent!)));
  const r = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
  const page = r.docs[0] as any; const sec = page.sections[0];
  const out:any[] = []; let i = 0;
  for (const n of sec.content.root.children) {
    i++;
    const t = norm(txt(n));
    if (n.type==="list" && t.startsWith("home") && i<=2) { console.log(slug, "drop crumbs"); continue; }
    if (out.length===0 && (t===norm(page.title) || t===norm(page.title)+" policy" || t==="terms and conditions" || t==="privacy policy" || t==="table of contents")) { console.log(slug, "drop dup title", t); continue; }
    if (n.type==="paragraph" && t && heads.has(t)) {
      out.push({ type:"heading", tag:"h2", format:"", indent:0, version:1, direction:null,
        children: n.children.filter((c:any)=>c.type==="text").map((c:any)=>({ ...c, text: c.text.trim(), format: c.format & ~1 })) });
      console.log(slug, "h2", t); continue;
    }
    out.push(n);
  }
  sec.content.root.children = out;
  await payload.update({ collection: "pages", id: page.id, data: { sections: page.sections } as never });
}
process.exit(0);
