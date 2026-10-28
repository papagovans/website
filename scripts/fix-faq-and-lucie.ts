/**
 * Two content fixes from the 10-28-2026 site audit (owner 2026-10-28):
 *   - FAQ, "How much does a campervan conversion cost?": the second bullet
 *     quoted the paused builder's trim packages (Essential, Adventure +$12,500,
 *     Summit +$28,000), which the site does not sell. It now names the four
 *     build tiers, the way the tier pages price them.
 *   - "Lucie's Olympus Build" was a second copy of The Sapphire Sojourner on
 *     WordPress too: same 31 photos byte for byte, same text. It goes back to
 *     draft so the gallery shows the van once; seo/live-urls.json sends its
 *     address to the Sapphire page.
 *
 *   npx tsx scripts/fix-faq-and-lucie.ts
 *
 * Safe to re-run. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const payload = await getPayload({ config });
const text = (t: string, bold = false) => ({ mode: "normal", text: t, type: "text", style: "", detail: 0, format: bold ? 1 : 0, version: 1 });

const faq = (await payload.find({ collection: "pages", where: { slug: { equals: "faq" } }, depth: 0, limit: 1 })).docs[0] as unknown as { id: number; sections: Record<string, any>[] };
let fixed = false;
for (const s of faq.sections) for (const q of s.items ?? []) {
  if (!/how much does a campervan conversion cost/i.test(q.question ?? "")) continue;
  for (const node of q.answer.root.children) for (const li of node.type === "list" ? node.children : []) {
    if (li.children?.[0]?.text !== "Trim package.") continue;
    li.children = [
      text("Build tier.", true),
      text(" Four floor plans, each one fully equipped, so you start from a finished van rather than speccing every system piece by piece."),
    ];
    fixed = true;
  }
}
if (fixed) {
  await payload.update({ collection: "pages", id: faq.id, data: { sections: faq.sections } as never });
  console.log("FAQ: trim package bullet replaced");
} else console.log("FAQ: already fixed");

const lucie = (await payload.find({ collection: "builds", where: { slug: { equals: "lucies-olympus-build" } }, depth: 0, limit: 1, draft: true })).docs[0] as { id: number; _status?: string } | undefined;
if (lucie && lucie._status !== "draft") {
  await payload.update({ collection: "builds", id: lucie.id, data: { _status: "draft" } as never });
  console.log("Lucie's Olympus Build: back to draft");
} else console.log("Lucie's Olympus Build: already a draft");

await revalidateLive(["/faq/", "/van-life-build-gallery/", "/projects/lucies-olympus-build/", "/"]);
process.exit(0);
