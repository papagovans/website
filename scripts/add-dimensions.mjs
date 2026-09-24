/*
 * Backfills intrinsic width and height onto every gallery entry.
 *
 * Without them the browser cannot reserve space before an image loads, so a
 * masonry wall reflows as it fills in. Reads the files already on disk rather
 * than re-fetching WordPress.
 *
 *   node scripts/add-dimensions.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DOCS = join(process.cwd(), "content", "projects");
const PUB = join(process.cwd(), "public");

let files = 0, shots = 0;
for (const f of (await readdir(DOCS)).filter((n) => n.endsWith(".json"))) {
  const path = join(DOCS, f);
  const doc = JSON.parse(await readFile(path, "utf8"));
  for (const s of doc.gallery) {
    if (s.w && s.h) continue;
    const { width, height } = await sharp(join(PUB, s.md_webp.replace(/^\//, ""))).metadata();
    s.w = width;
    s.h = height;
    shots++;
  }
  await writeFile(path, JSON.stringify(doc, null, 2) + "\n");
  files++;
}
console.log(`${files} galleries, ${shots} images measured`);
