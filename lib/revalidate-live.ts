/*
 * For scripts/: after a script changes a page in Payload, call this so the
 * live site rebuilds it on the next visit instead of waiting for a deploy.
 *
 *   await revalidateLive(["/privacy-policy/"]);
 *
 * Needs REVALIDATE_SECRET in .env.local, the same value as in Vercel. It
 * never throws: a failed refresh only means the change waits for a deploy.
 */
import { SITE_URL } from "./site";

export async function revalidateLive(paths: string[]) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return console.warn("REVALIDATE_SECRET is not set; the change goes live on the next deploy.");
  try {
    const res = await fetch(`${process.env.REVALIDATE_URL ?? SITE_URL}/api/revalidate/`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ paths }),
    });
    if (res.ok) console.log(`live site refreshed: ${paths.join(", ")}`);
    else console.warn(`refresh failed (${res.status}); the change goes live on the next deploy.`);
  } catch (e) {
    console.warn(`refresh failed (${(e as Error).message}); the change goes live on the next deploy.`);
  }
}
