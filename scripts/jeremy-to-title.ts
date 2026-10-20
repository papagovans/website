/**
 * Owner 2026-10-20: buyer-facing copy names the role, not the person:
 * "Jeremy" becomes "our Senior Build Consultant" everywhere except the About
 * Us page (team section), where people are named. Also fixes his team photo's
 * description, which still said Sales Manager.
 *
 *   npx tsx scripts/jeremy-to-title.ts
 *
 * Safe to re-run. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const SWAPS: [string, string][] = [
  ["take a slot on Jeremy's calendar", "take a slot on our Senior Build Consultant's calendar"],
  ["book a time with Jeremy.", "book a time with our Senior Build Consultant."],
  ["A call with Jeremy about", "A call with our Senior Build Consultant about"],
  ["pick a time with Jeremy and", "pick a time with our Senior Build Consultant and"],
];
const swap = (s: string) => SWAPS.reduce((acc, [a, b]) => acc.split(a).join(b), s);

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: "pages", pagination: false, depth: 0 });
const touched: string[] = [];
for (const d of docs as { id: number; slug: string; _status?: string }[]) {
  if (d.slug === "about-us") continue;
  const before = JSON.stringify(d);
  if (!before.includes("Jeremy")) continue;
  const after = JSON.parse(swap(before));
  if (JSON.stringify(after) === before) continue;
  const { intro, seoDescription, sections, heading, eyebrow } = after;
  await payload.update({ collection: "pages", id: d.id, data: { intro, seoDescription, sections, heading, eyebrow, ...(d._status ? { _status: "published" } : {}) } as never });
  touched.push(`/${d.slug}/`);
}
console.log("pages:", touched.join(", "));

const photo = (await payload.find({ collection: "media", where: { alt: { equals: "Jeremy, Sales Manager at Papago Vans" } }, depth: 0 })).docs[0];
if (photo) {
  await payload.update({ collection: "media", id: photo.id, data: { alt: "Jeremy, Senior Build Consultant at Papago Vans" } as never });
  console.log("photo alt fixed:", photo.id);
}

await revalidateLive([...touched, "/about-us/"]);
process.exit(0);
