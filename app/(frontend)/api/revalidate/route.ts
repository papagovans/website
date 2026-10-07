import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";

/*
 * Clears the prerendered copy of pages a script just changed, owner
 * 2026-10-07. Payload's own hook (collections/revalidate.ts) only runs inside
 * a Next request, so edits made from scripts/ stayed invisible until the next
 * deploy. Scripts call this through lib/revalidate-live.ts:
 *
 *   POST /api/revalidate/   x-revalidate-secret: <REVALIDATE_SECRET>
 *   { "paths": ["/privacy-policy/"] }
 *
 * It can only mark pages for a rebuild on their next visit; it reads and
 * changes nothing. Without the secret set in Vercel it refuses everything.
 */
const ok = (given: string | null) => {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !given) return false;
  const a = Buffer.from(given), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(req: Request) {
  if (!ok(req.headers.get("x-revalidate-secret"))) return new Response("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  const paths: unknown = body?.paths;
  // Our own pages only: "/privacy-policy/", never "//elsewhere.com".
  if (!Array.isArray(paths) || !paths.length || paths.length > 50 || !paths.every((p) => typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && p.length < 1024))
    return Response.json({ error: 'Send { "paths": ["/some-page/"] }, up to 50.' }, { status: 400 });
  for (const p of paths) revalidatePath(p);
  return Response.json({ revalidated: paths });
}
