/**
 * Puts the "Which Build Fits You?" quiz on the home page, owner 2026-10-06:
 * a Quiz Starter section right after "Two Ways To Build Your Van", and the
 * hero's second button pointed at it.
 *
 *   npx tsx scripts/add-home-quiz.ts
 *
 * Safe to re-run: it adds the section only once. Already run; edit in /admin.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const payload = await getPayload({ config });
const home = (await payload.find({ collection: "pages", where: { slug: { equals: "home" } }, depth: 0, limit: 1 })).docs[0];
const sections = [...(home.sections ?? [])] as Record<string, unknown>[];

if (!sections.some((s) => s.blockType === "quizStart")) {
  const after = sections.findIndex((s) => s.blockType === "pathCards");
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
const hero = sections[0];
if (hero?.blockType === "hero") hero.secondButton = { to: "custom", url: "#which-build", text: "Which Build Fits You?" };

await payload.update({ collection: "pages", id: home.id, data: { sections } as never });
console.log("home:", sections.map((s) => s.blockType).join(", "));
process.exit(0);
