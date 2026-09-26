/**
 * Fails if any timeline milestone is still marked "This date is a guess".
 *
 * The owner asked for dates to be filled in and checked later (2026-09-25),
 * and "later" is exactly the kind of thing that gets forgotten between
 * staging and launch. Staging is noindex, so this only warns today. With
 * --strict (the launch checklist) it exits non-zero instead: nobody has to
 * remember, the check remembers.
 *
 *   npm run check:provisional     # warn
 *   npm run check:launch          # fail on anything left
 */
import { createRequire } from "module";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const strict = process.argv.includes("--strict");
const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: "pages", pagination: false, depth: 0 });

const found = docs.flatMap((p) =>
  (p.sections ?? []).flatMap((s) =>
    s.blockType === "timeline" ? (s.items ?? []).filter((m) => m.provisional).map((m) => `${p.title}: ${m.when} (${m.title})`) : [],
  ),
);

if (!found.length) {
  console.log("check-provisional: no guessed dates left.");
  process.exit(0);
}
console.log(`check-provisional: ${found.length} milestone date${found.length === 1 ? " is" : "s are"} still marked as a guess:`);
for (const f of found) console.log(`  ${f}`);
console.log("  Confirm each one in /admin (Pages, then its Timeline section) and untick \"This date is a guess\".");
process.exit(strict ? 1 : 0);
