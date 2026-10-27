/**
 * About Us hero, owner 2026-10-27: no group still and no Papago logo at the
 * start. The video now starts (and loops back) at 0:06, after the logo intro
 * (HeroVideo reads "?t=6" off the link), and the photo shown while it loads is
 * that same 0:06 frame instead of the crew photo. The crew photo stays in the
 * section further down the page.
 *
 *   npx tsx scripts/about-hero-skip-intro.ts
 *
 * Safe to re-run. Already run; edit in /admin from here on.
 */
import { createRequire } from "module";
import { readFile } from "fs/promises";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const { revalidateLive } = await import("../lib/revalidate-live.ts");

const payload = await getPayload({ config });
const FILE = "about-hero-van-desert.jpg";
let photo = (await payload.find({ collection: "media", where: { filename: { equals: FILE } }, limit: 1, depth: 0 })).docs[0]?.id;
if (!photo) {
  const data = await readFile(`assets/about/${FILE}`);
  photo = (await payload.create({ collection: "media", data: { alt: "A Papago camper van parked beside a desert road in the Sonoran Desert near Phoenix at sunset" }, file: { data, name: FILE, mimetype: "image/jpeg", size: data.length } })).id;
}
const page = (await payload.find({ collection: "pages", where: { slug: { equals: "about-us" } }, limit: 1, depth: 0 })).docs[0] as unknown as { id: number; sections: Record<string, unknown>[] };
const hero = page.sections[0];
if (hero.blockType !== "hero") throw new Error("About Us does not start with a hero");
hero.image = photo;
hero.video = "https://youtu.be/HcR47jEgAu8?t=6";
await payload.update({ collection: "pages", id: page.id, data: { sections: page.sections, _status: "published" } as never });
console.log("about-us hero:", hero.video, "image", photo);
await revalidateLive(["/about-us/"]);
process.exit(0);
