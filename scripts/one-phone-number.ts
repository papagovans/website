/**
 * One number for sales and service, owner 2026-10-08: (480) 761-7175. The code
 * side is lib/site.ts (SERVICE_PHONE = SALES_PHONE); this fixes the two
 * places the CMS spelled it out:
 *   - Contact Us: the Sales and Service cards become one full-width
 *     "Sales & Service" card.
 *   - Service Department: the call button read "Call (520) 666-4283".
 *
 *   npx tsx scripts/one-phone-number.ts
 *
 * Safe to re-run. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");
const { SALES_PHONE } = await import("../lib/site.ts");

const payload = await getPayload({ config });
const page = async (slug: string) => (await payload.find({ collection: "pages", where: { slug: { equals: slug } }, depth: 0, limit: 1 })).docs[0] as unknown as { id: number; sections: Record<string, any>[] };

const contact = await page("contact-us");
const cards = contact.sections.find((s) => s.blockType === "cards");
if (cards && !cards.items.some((c: { title: string }) => c.title === "Sales & Service")) {
  const rest = cards.items.filter((c: { title: string }) => !["Sales", "Service"].includes(c.title));
  cards.items = [
    { title: "Sales & Service", text: "New builds, pricing and build slots, plus repairs, upgrades and unfinished builds on any van.", highlight: { to: "sales" }, wide: true },
    ...rest,
  ];
  await payload.update({ collection: "pages", id: contact.id, data: { sections: contact.sections, _status: "published" } as never });
  console.log("contact-us cards:", cards.items.map((c: { title: string }) => c.title).join(", "));
}

const service = await page("service-department");
let fixed = 0;
const walk = (o: unknown): unknown => {
  if (typeof o === "string" && /\(?520\)?[ -]?666-?4283/.test(o)) { fixed++; return o.replace(/\(?520\)?[ -]?666-?4283/g, SALES_PHONE); }
  if (Array.isArray(o)) return o.map(walk);
  if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, walk(v)]));
  return o;
};
const sections = walk(service.sections);
if (fixed) await payload.update({ collection: "pages", id: service.id, data: { sections, _status: "published" } as never });
console.log(`service-department: ${fixed} replaced`);

await revalidateLive(["/contact-us/", "/service-department/"]);
process.exit(0);
