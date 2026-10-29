/**
 * Sales manager 2026-10-29: the first call is with the Client Advisor
 * (Rachel), who qualifies the lead before the Senior Build Consultant books
 * them. CALENDAR_URL in lib/site.ts now points at her; this rewrites the CMS
 * copy that promised the first call with the Senior Build Consultant.
 *
 *   npx tsx scripts/first-call-to-advisor.ts
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
  ["take a slot on our Senior Build Consultant's calendar", "take a slot on our Client Advisor's calendar"],
  ["book a time with our Senior Build Consultant.", "book a time with our Client Advisor."],
  ["Book a call with our Senior Build Consultant if", "Book a call with our Client Advisor if"],
  ["A call with our Senior Build Consultant about", "A call with our Client Advisor about"],
  [
    "If it's a fit, you'll pick a time with our Senior Build Consultant and get a real completion date on the first call.",
    "Then pick a time with our Client Advisor to talk it through.",
  ],
];
const swap = (s: string) => SWAPS.reduce((acc, [a, b]) => acc.split(a).join(b), s);

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: "pages", pagination: false, depth: 0 });
const touched: string[] = [];
for (const d of docs as { id: number; slug: string; _status?: string }[]) {
  const before = JSON.stringify(d);
  const after = JSON.parse(swap(before));
  if (JSON.stringify(after) === before) continue;
  const { intro, seoDescription, sections, heading, eyebrow } = after;
  await payload.update({ collection: "pages", id: d.id, data: { intro, seoDescription, sections, heading, eyebrow, ...(d._status ? { _status: "published" } : {}) } as never });
  touched.push(d.slug === "home" ? "/" : `/${d.slug}/`);
}
console.log("pages:", touched.join(", "));
await revalidateLive(touched);
process.exit(0);
