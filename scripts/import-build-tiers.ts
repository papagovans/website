/**
 * Rebuilds papagovans.com/van-conversion-build-tiers/ as a CMS page, owner
 * 2026-10-01: the builder and its new pricing wait, so the old tiers and
 * prices come back.
 *
 *   npx tsx scripts/import-build-tiers.ts <folder of photos>
 *
 * The folder holds the photos pulled off the live page: build-tiers-hero,
 * build-tier-el-capitan, build-tier-olympus and build-tier-rainier, as .webp.
 * McKinley and Zion reuse their own pages' photos, because the old banners
 * for them are 383px wide. Copy and prices are the live page's, Mammoth
 * renamed McKinley. Safe to re-run: the page matches on slug, photos on
 * filename. Already run; edit the page in /admin from here on.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const DIR = process.argv[2];
if (!DIR) throw new Error("Pass the folder of photos.");
const payload = await getPayload({ config });

async function photo(name: string, alt: string) {
  const found = await payload.find({ collection: "media", where: { filename: { equals: `${name}.webp` } }, limit: 1 });
  if (found.docs[0]) return found.docs[0].id;
  const data = await readFile(path.join(DIR, `${name}.webp`));
  return (await payload.create({
    collection: "media",
    data: { alt },
    file: { data, name: `${name}.webp`, mimetype: "image/webp", size: data.length },
  })).id;
}
const existing = async (filename: string) =>
  (await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1 })).docs[0]!.id;

const data = {
  title: "Van Conversion Build Tiers",
  slug: "van-conversion-build-tiers",
  seoTitle: "Van Conversion Build Tiers | Papago Vans",
  seoDescription:
    "Compare Papago's five camper van build tiers, from Rainier to El Capitan, with starting prices. Built on the Ram ProMaster, Ford Transit or Mercedes-Benz Sprinter.",
  _status: "published" as const,
  sections: [
    {
      blockType: "hero" as const,
      image: await photo("build-tiers-hero", "A Papago camper van with its awning out on rocky desert ground"),
      heading: "Van Conversion\nBuild Tiers",
      button: { to: "calendar" },
    },
    {
      blockType: "buildTiers" as const,
      heading: "Build Tiers",
      intro:
        "Each conversion van layout can be applied to most cargo van models including RAM Promaster, Ford Transit and Mercedes-Benz Sprinter, which one is right for you?\n\nEach build we create is 100% custom, meaning no matter the tier, you will have full control over the design and layout of your van.",
      priceHeading: "Build Tiers by Price",
      tiers: [
        { name: "El Capitan", tagline: "The Luxury Explorer", price: 127395, link: "/el-capitan-luxury-van-build/", art: "el-capitan" as const,
          photo: await photo("build-tier-el-capitan", "The El Capitan, a dark grey Sprinter with a pop-top, parked by a lake") },
        { name: "Olympus", tagline: "The Traveling Nomad", price: 108595, link: "/olympus/", art: "olympus" as const,
          photo: await photo("build-tier-olympus", "The Olympus with its awning and side door open in the Arizona desert") },
        { name: "McKinley", tagline: "The Happy Camper", price: 69295, link: "/mckinley/", art: "mckinley" as const,
          photo: await existing("mammoth-2.webp") },
        { name: "Zion", tagline: "Adventure Seeker", price: 86795, link: "/zion/", art: "zion" as const,
          photo: await existing("zion-2.webp") },
        { name: "Rainier", tagline: "The Weekend Warrior", price: 53595, art: "rainier" as const,
          photo: await photo("build-tier-rainier", "The side of a white Papago Sprinter with the mountain graphic") },
      ],
    },
  ],
};

const found = await payload.find({ collection: "pages", where: { slug: { equals: data.slug } }, limit: 1, draft: true });
const doc = found.docs[0]
  ? await payload.update({ collection: "pages", id: found.docs[0].id, data })
  : await payload.create({ collection: "pages", data });
console.log("page", doc.id, `/${doc.slug}/`);
process.exit(0);
