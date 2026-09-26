/**
 * Re-cut every Media Library image at the current sizes in collections/Media.ts.
 *
 *   npx tsx scripts/regenerate-media.ts [--prefix build-]
 *
 * Run after changing imageSizes: Payload only cuts sizes on upload, so photos
 * uploaded before a change keep the old set. Each master copy is downloaded
 * and handed back as the same document, so every page, post and build that
 * uses it keeps pointing at it. Skips images that already have every size.
 */
import { createRequire } from "module";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");

const prefix = process.argv.includes("--prefix") ? process.argv[process.argv.indexOf("--prefix") + 1] : undefined;
const skipPrefix = process.argv.includes("--skip") ? process.argv[process.argv.indexOf("--skip") + 1] : undefined;
const payload = await getPayload({ config });
const wanted = (payload.collections.media.config.upload as { imageSizes: { name: string; width: number }[] }).imageSizes;

const { docs } = await payload.find({ collection: "media", pagination: false, depth: 0 });
let redone = 0;
for (const m of docs) {
  if (!m.url || !m.filename) continue;
  if (prefix && !m.filename.startsWith(prefix)) continue;
  if (skipPrefix && m.filename.startsWith(skipPrefix)) continue;
  // A size the original is too small for is correctly absent; only a size it
  // could have and does not counts as missing.
  const missing = wanted.filter((s) => (m.width ?? 0) >= s.width && !m.sizes?.[s.name as keyof typeof m.sizes]?.url);
  if (!missing.length) continue;
  const data = Buffer.from(await (await fetch(m.url)).arrayBuffer());
  await payload.update({
    collection: "media",
    id: m.id,
    data: {},
    file: { data, name: m.filename, mimetype: m.mimeType ?? "image/webp", size: data.length },
  });
  redone++;
  if (redone % 10 === 0) console.log(`  ${redone} re-cut`);
}
console.log(`done: ${redone} of ${docs.length} images re-cut`);
process.exit(0);
