/*
 * Fails if provisional content is still in the tree.
 *
 * Three timeline milestones carry guessed dates: the facts are verified and
 * public, the months are not. The owner asked for them to be filled in and
 * checked later (2026-09-25), and "later" is exactly the kind of thing that
 * gets forgotten between staging and launch.
 *
 * Staging is noindex so this only warns today. Run it with --strict in the
 * launch checklist and it exits non-zero instead, which is the point: nobody
 * has to remember, the check remembers.
 *
 *   node scripts/check-provisional.mjs           # warn
 *   node scripts/check-provisional.mjs --strict  # fail the build
 */
import { readFileSync } from "node:fs";

const strict = process.argv.includes("--strict");
const src = readFileSync(new URL("../app/about-us/page.tsx", import.meta.url), "utf8");

const found = [...src.matchAll(/when:\s*"([^"]+)",\s*\n\s*provisional:\s*true/g)].map((m) => m[1]);

if (!found.length) {
  console.log("check-provisional: nothing provisional left.");
  process.exit(0);
}

const lines = [
  `check-provisional: ${found.length} timeline entr${found.length === 1 ? "y has a" : "ies have"} guessed date${found.length === 1 ? "" : "s"}: ${found.join(", ")}.`,
  "  The events are verified. The dates are not. Replace them in app/about-us/page.tsx",
  "  and delete the `provisional` flag before papagovans.com points at this site.",
];
console[strict ? "error" : "warn"](lines.join("\n"));
process.exit(strict ? 1 : 0);
