/**
 * Adds the carrier template wording, verbatim, as the closing paragraph of the
 * privacy policy's "Mobile Messaging (SMS) Privacy Policy" section, owner
 * 2026-10-07. SMS registration reviewers look for this exact text. Nothing
 * else on the page changes.
 *
 *   npx tsx scripts/add-sms-template.ts
 *
 * Safe to re-run: it adds the paragraph only once. Already run.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const TEMPLATE =
  "Mobile information will not be shared with third parties/affiliates for marketing/promotional purposes. Any other mentions in this policy exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties. If you wish to be removed from receiving future communications, you can opt out by texting STOP.";

type Node = { type: string; text?: string; children?: Node[]; [k: string]: unknown };
const plain = (n: Node): string => n.text ?? (n.children ?? []).map(plain).join("");

const payload = await getPayload({ config });
const page = (await payload.find({ collection: "pages", where: { slug: { equals: "privacy-policy" } }, depth: 0, limit: 1 })).docs[0] as unknown as { id: number; sections: { blockType: string; content?: { root: { children: Node[] } } }[] };
const nodes = page.sections.find((s) => s.blockType === "text")?.content?.root.children;
if (!nodes) throw new Error("No text section on the privacy policy.");
const start = nodes.findIndex((n) => n.type === "heading" && plain(n) === "Mobile Messaging (SMS) Privacy Policy");
if (start < 0) throw new Error("SMS heading not found; nothing changed.");
let end = start + 1;
while (end < nodes.length && nodes[end].type !== "heading") end++;

if (nodes.slice(start, end).some((n) => plain(n) === TEMPLATE)) console.log("already there; nothing changed");
else {
  nodes.splice(end, 0, {
    type: "paragraph", format: "", indent: 0, version: 1, direction: null, textFormat: 0, textStyle: "",
    children: [{ mode: "normal", text: TEMPLATE, type: "text", style: "", detail: 0, format: 0, version: 1 }],
  } as unknown as Node);
  await payload.update({ collection: "pages", id: page.id, data: { sections: page.sections, _status: "published" } as never });
  console.log(`added after: ${plain(nodes[end - 1]).slice(0, 50)} | before: ${plain(nodes[end + 1]).slice(0, 40)}`);
}
await revalidateLive(["/privacy-policy/"]);
process.exit(0);
