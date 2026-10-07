/**
 * The privacy policy's SMS section, in the owner's exact words (2026-10-07).
 * Replaces the "Text Messaging (SMS)" section added earlier the same day (a
 * heading and the paragraphs under it, up to the next heading). Nothing else
 * on the page changes.
 *
 *   npx tsx scripts/set-sms-privacy.ts
 *
 * Safe to re-run: it finds either heading. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

type Node = { type: string; text?: string; children?: Node[]; [k: string]: unknown };
const text = (t: string, bold = false) => ({ mode: "normal", text: t, type: "text", style: "", detail: 0, format: bold ? 1 : 0, version: 1 });
const block = { format: "", indent: 0, version: 1, direction: null };
const heading = (t: string) => ({ tag: "h2", type: "heading", ...block, children: [text(t)] });
const paragraph = (t: string) => ({ type: "paragraph", ...block, textFormat: 0, textStyle: "", children: [text(t)] });
const item = (label: string, rest: string, value: number) => ({ type: "listitem", value, ...block, children: [text(label, true), text(rest)] });

const HEADING = "Mobile Messaging (SMS) Privacy Policy";
const section = [
  heading(HEADING),
  paragraph("Papago Vans is committed to protecting your privacy. We collect phone numbers only from users who explicitly opt-in to receive mobile text messages from us."),
  {
    tag: "ul", type: "list", listType: "bullet", start: 1, ...block,
    children: [
      item("Data Collection & Usage:", " Mobile numbers collected for SMS communication will be used solely to respond to your inquiries, provide customer support, or send requested service updates.", 1),
      item("No Third-Party Sharing:", " No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties or marketing partners.", 2),
      item("Opt-Out:", " You can opt-out of receiving text messages at any time by replying STOP to any message you receive from us. For help, reply HELP.", 3),
    ],
  },
];

const payload = await getPayload({ config });
const page = (await payload.find({ collection: "pages", where: { slug: { equals: "privacy-policy" } }, depth: 0, limit: 1 })).docs[0] as unknown as { id: number; sections: { blockType: string; content?: { root: { children: Node[] } } }[] };
const content = page.sections.find((s) => s.blockType === "text")?.content;
if (!content) throw new Error("No text section on the privacy policy.");
const nodes = content.root.children;
const plain = (n: Node): string => n.text ?? (n.children ?? []).map(plain).join("");
const start = nodes.findIndex((n) => n.type === "heading" && ["Text Messaging (SMS)", HEADING].includes(plain(n)));
if (start < 0) throw new Error("SMS heading not found; nothing changed.");
let end = start + 1;
while (end < nodes.length && nodes[end].type !== "heading") end++;
console.log(`replacing nodes ${start}-${end - 1}: ${nodes.slice(start, end).map((n) => plain(n).slice(0, 40)).join(" | ")}`);
nodes.splice(start, end - start, ...(section as unknown as Node[]));

await payload.update({ collection: "pages", id: page.id, data: { sections: page.sections, _status: "published" } as never });
console.log(`now: ${nodes.slice(start - 1, start + 4).map((n) => plain(n).slice(0, 50)).join(" | ")}`);
await revalidateLive(["/privacy-policy/"]);
process.exit(0);
