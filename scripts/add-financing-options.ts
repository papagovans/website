/**
 * Financing page: the four ways buyers pay for a Papago, owner 2026-10-21,
 * as cards with a lender logo or icon. Worded without specific down
 * payments, terms or rates: under Truth in Lending (Reg Z) those are
 * trigger terms that require the APR beside them, and the page already
 * promises not to quote numbers that change by signing. Logos and icons
 * live in assets/financing/ (Mercedes-Benz from the marketing logo folder,
 * RVIA already in media, two icons drawn for this page).
 *
 *   npx tsx scripts/add-financing-options.ts
 *
 * Safe to re-run: media match on filename, the section is added once.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const payload = await getPayload({ config });
const upload = async (file: string, alt: string) => {
  const found = (await payload.find({ collection: "media", where: { filename: { equals: file } }, limit: 1, depth: 0 })).docs[0];
  if (found) return found.id;
  const data = await readFile(`assets/financing/${file}`);
  return (await payload.create({ collection: "media", data: { alt }, file: { data, name: file, mimetype: "image/webp", size: data.length } })).id;
};
const rvia = (await payload.find({ collection: "media", where: { filename: { equals: "logo-rv-industry-association.webp" } }, limit: 1, depth: 0 })).docs[0]?.id;

const HEADING = "Ways To Finance Your Papago";
const section = {
  blockType: "cards",
  heading: HEADING,
  items: [
    {
      title: "Mercedes-Benz Financial Services",
      text: "Papago Vans is a certified Mercedes-Benz Expert Upfitter, so Mercedes-Benz can finance the van and the conversion together, or the van on its own. Flexible down payment options and extended terms are available, subject to credit approval.",
      logo: await upload("logo-mercedes-benz.webp", "Mercedes-Benz"),
    },
    {
      title: "RV Lending",
      text: "Every Papago is RVIA certified, so it qualifies for RV loans from banks and credit unions. RV lenders typically look for strong credit and a larger down payment, and in return offer some of the longest repayment terms available for a vehicle.",
      logo: rvia,
    },
    {
      title: "Life Insurance Policy Loan",
      text: "If you hold a whole or universal life insurance policy with cash value, you may be able to borrow against it, often at a favorable rate. Your insurance provider can tell you what your policy allows.",
      logo: await upload("finance-icon-life-insurance.webp", "Life insurance policy loan"),
    },
    {
      title: "Home Equity Line Of Credit",
      text: "If you own your home, a home equity line of credit (HELOC) lets you borrow against the equity you have built. Your bank or credit union can tell you how much you can access and at what rate. Your home secures the line, so weigh it carefully.",
      logo: await upload("finance-icon-home-equity.webp", "Home equity line of credit"),
    },
  ],
};

const page = (await payload.find({ collection: "pages", where: { slug: { equals: "financing" } }, limit: 1, depth: 0 })).docs[0] as unknown as { id: number; sections: Record<string, unknown>[] };
if (!page.sections.some((s) => s.blockType === "cards" && s.heading === HEADING)) {
  const after = page.sections.findIndex((s) => s.blockType === "cards");
  page.sections.splice(after + 1, 0, section);
  await payload.update({ collection: "pages", id: page.id, data: { sections: page.sections, _status: "published" } as never });
}
console.log("financing:", page.sections.map((s) => `${s.blockType}${s.heading ? `(${s.heading})` : ""}`).join(", "));
process.exit(0);
