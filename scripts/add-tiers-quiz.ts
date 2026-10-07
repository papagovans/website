/**
 * Puts the "Which Build Fits You?" Quiz Starter on the build tiers page
 * (/van-conversion-build-tiers/) right below the hero, owner 2026-10-07.
 * Same copy as the home page section.
 *
 *   npx tsx scripts/add-tiers-quiz.ts          # dry run, prints the sections
 *   npx tsx scripts/add-tiers-quiz.ts --write
 *
 * Safe to re-run: it adds the section only once. Already run; edit in /admin.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const payload = await getPayload({ config });
const page = (await payload.find({ collection: "pages", where: { slug: { equals: "van-conversion-build-tiers" } }, depth: 0, limit: 1 })).docs[0];
if (!page) throw new Error("no page with slug van-conversion-build-tiers");
const sections = [...(page.sections ?? [])] as Record<string, unknown>[];
console.log("before:", sections.map((s) => s.blockType).join(", "));

if (!sections.some((s) => s.blockType === "quizStart")) {
  const after = sections.findIndex((s) => s.blockType === "hero");
  sections.splice(after + 1, 0, {
    blockType: "quizStart",
    anchor: "which-build",
    eyebrow: "Not sure which build?",
    heading: "Which Build Fits You?",
    text: "Tell us how you travel, who comes along and what you want to spend. We'll match you to the Papago build that fits, with the starting price, van included.",
    points: [
      { text: "Eight quick questions, about two minutes" },
      { text: "Your matching build and its starting price at the end" },
      { text: "Book a call with our sales manager if you want to talk it through" },
    ],
  });
}
console.log("after: ", sections.map((s) => s.blockType).join(", "));

if (process.argv.includes("--write")) {
  await payload.update({ collection: "pages", id: page.id, data: { sections } as never });
  console.log("saved");
}
process.exit(0);
