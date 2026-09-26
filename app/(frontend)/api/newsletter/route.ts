import { NextResponse } from "next/server";

/*
 * Newsletter signup.
 *
 * Posts to a HubSpot form rather than the CRM API, the same way the build
 * configurator submits its leads. A form submission needs no private app
 * token, so nothing secret lives in this repo, and whoever owns the form can
 * change its fields, its notifications and its follow-up without a deploy.
 *
 * The portal is Papago's and is not a secret; only the form id has to be set:
 *
 *   vercel env add HUBSPOT_NEWSLETTER_FORM_ID --scope papago
 *
 * Until it is, this returns `configured: false` and the band says so instead
 * of swallowing an address. A signup form that reports success and stores
 * nothing is worse than one that admits it is not connected.
 */

const PORTAL_ID = process.env.HUBSPOT_PORTAL_ID ?? "43782575";
const FORM_ID = process.env.HUBSPOT_NEWSLETTER_FORM_ID;

/* Shape only. HubSpot does the real validation, and a stricter regex here
   would reject valid addresses for no gain. */
const looksLikeEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  if (!looksLikeEmail(email)) {
    return NextResponse.json({ ok: false, reason: "invalid-email" }, { status: 400 });
  }

  if (!FORM_ID) {
    /* Loud on the server so this shows up the first time anyone tests it,
       rather than being discovered weeks later by a missing list. */
    console.warn("newsletter: HUBSPOT_NEWSLETTER_FORM_ID is not set, signup dropped");
    return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fields: [
            { objectTypeId: "0-1", name: "email", value: email },
            { objectTypeId: "0-1", name: "papago_lead_source", value: "Website Newsletter" },
          ],
          context: { pageUri: request.headers.get("referer") ?? "", pageName: "Newsletter band" },
        }),
      },
    );
    if (!res.ok) {
      console.error("newsletter: HubSpot returned", res.status, await res.text());
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("newsletter: HubSpot unreachable", err);
    return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
  }
}
