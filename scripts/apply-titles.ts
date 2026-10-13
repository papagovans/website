/**
 * Customer-facing titles, owner 2026-10-13: the SDRs are Client Advisors and
 * Jeremy (sales manager) is the Senior Build Consultant. Rewrites the CMS
 * copy that named the old roles: both Quiz Starter check marks and the three
 * team cards. Code copy (the calendar box) is changed in the components.
 *
 *   npx tsx scripts/apply-titles.ts            # dry run
 *   npx tsx scripts/apply-titles.ts --write
 *
 * Safe to re-run. Already run; edit in /admin.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const write = process.argv.includes("--write");
const payload = await getPayload({ config });
const OLD = "Book a call with our sales manager if you want to talk it through";
const NEW = "Book a call with our Senior Build Consultant if you want to talk it through";

for (const slug of ["home", "van-conversion-build-tiers"]) {
  const page = (await payload.find({ collection: "pages", where: { slug: { equals: slug } }, depth: 0, limit: 1 })).docs[0];
  const sections = structuredClone(page.sections ?? []) as Record<string, unknown>[];
  let n = 0;
  for (const s of sections) for (const p of (s.points as { text: string }[] | undefined) ?? []) if (p.text === OLD) { p.text = NEW; n++; }
  console.log(`${slug}: ${n} change(s)`);
  if (write && n) await payload.update({ collection: "pages", id: page.id, data: { sections } as never });
}

const roles: Record<string, string> = { Jeremy: "Senior Build Consultant", Rachel: "Client Advisor", Giselle: "Client Advisor" };
for (const [name, role] of Object.entries(roles)) {
  const doc = (await payload.find({ collection: "team", where: { name: { equals: name } }, depth: 0, limit: 1 })).docs[0];
  console.log(`team ${name}: ${(doc as { role?: string }).role} -> ${role}`);
  if (write) await payload.update({ collection: "team", id: doc.id, data: { role } as never });
}
process.exit(0);
