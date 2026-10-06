/**
 * The "Which Build Fits You?" page, owner 2026-10-05: a full-photo hero with
 * the HubSpot quiz beside the headline. It replaces the old /quiz/ page.
 *
 *   npx tsx scripts/create-quiz-page.ts
 *
 * Safe to re-run: it matches on slug. Already run; edit it in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { QUIZ_FORM_ID } = await import("../lib/site.ts");

const payload = await getPayload({ config });
const SLUG = "which-build-fits-you";
const photo = (await payload.find({ collection: "media", where: { filename: { equals: "home-hero-1.webp" } }, limit: 1 })).docs[0];
if (!photo) throw new Error("home-hero-1.webp is not in the media library.");

const data = {
  title: "Which Build Fits You?",
  slug: SLUG,
  seoTitle: "Which Build Fits You? Camper Van Quiz | Papago Vans",
  seoDescription: "Answer eight quick questions and see which Papago Vans build tier fits how you travel, with the starting price, van included. Built in Mesa, Arizona.",
  _status: "published" as const,
  sections: [
    {
      blockType: "hero" as const,
      image: photo.id,
      heading: "Which Build\nFits You?",
      text: "Eight quick questions about how you travel. We'll match you to the Papago build tier that fits, with the price, van included.",
      formId: QUIZ_FORM_ID,
    },
  ],
};

const existing = (await payload.find({ collection: "pages", where: { slug: { equals: SLUG } }, limit: 1, depth: 0 })).docs[0];
if (existing) await payload.update({ collection: "pages", id: existing.id, data: data as never });
else await payload.create({ collection: "pages", data: data as never });
console.log(`${existing ? "updated" : "created"} /${SLUG}/`);
process.exit(0);
