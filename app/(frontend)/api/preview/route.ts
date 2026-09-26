import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

/*
 * The admin's Preview button lands here. Signed-in staff get Next's draft
 * mode, which renders the latest saved draft instead of the published
 * version; everyone else is turned away. ?exit=1 switches it back off.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("path") ?? "/";
  // Only our own pages: a path, never "//elsewhere.com".
  const path = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const dm = await draftMode();
  if (url.searchParams.has("exit")) {
    dm.disable();
    redirect(path);
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return new Response("Sign in at /admin to preview drafts.", { status: 401 });

  dm.enable();
  redirect(path);
}
