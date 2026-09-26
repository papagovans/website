import { NextResponse } from "next/server";
import { cleanHutk, pageUriFrom, submitHubSpotForm } from "@/lib/hubspot";

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

const FORM_ID = process.env.HUBSPOT_NEWSLETTER_FORM_ID;

/* Shape only. HubSpot does the real validation, and a stricter regex here
   would reject valid addresses for no gain. */
const looksLikeEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

export async function POST(request: Request) {
  let email = "";
  let hutk: string | undefined;
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim();
    hutk = cleanHutk(body?.hutk);
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
    const res = await submitHubSpotForm(
      FORM_ID,
      { email },
      { pageUri: pageUriFrom(null, request.headers.get("referer")), pageName: "Newsletter band", hutk },
    );
    if (!res.ok) {
      console.error("newsletter: HubSpot returned", res.status, res.body);
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("newsletter: HubSpot unreachable", err);
    return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
  }
}
