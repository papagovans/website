import { NextResponse } from "next/server";
import { HEARD, INTERESTS } from "@/lib/contact";
import { cleanHutk, pageUriFrom, submitHubSpotForm } from "@/lib/hubspot";

/*
 * Service request form -> the HubSpot form in HUBSPOT_CONTACT_FORM_ID:
 *
 *   vercel env add HUBSPOT_CONTACT_FORM_ID --scope papago
 *
 * Until it is set this answers 503 and the form says to call, rather than
 * reporting success over a dropped request. Sales enquiries do not come
 * through here: they use HubSpot's own embedded form (HubSpotForm.tsx).
 *
 * Spam: a hidden field people never fill and a minimum time on the form.
 * A bot that trips either is told it succeeded, so it learns nothing.
 */
const FORM_ID = process.env.HUBSPOT_CONTACT_FORM_ID;
const looksLikeEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const pick = <T extends readonly string[]>(list: T, v: unknown) => (list.includes(String(v)) ? String(v) : undefined);
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  if (text(b.company, 200) || Number(b.elapsed) < 2500) return NextResponse.json({ ok: true });

  const lead = {
    firstname: text(b.firstname, 80),
    lastname: text(b.lastname, 80),
    email: text(b.email, 200),
    phone: text(b.phone, 40),
  };
  if (!lead.firstname || !lead.lastname || !looksLikeEmail(lead.email) || lead.phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }
  if (!FORM_ID) {
    console.warn("contact: HUBSPOT_CONTACT_FORM_ID is not set, service request not delivered");
    return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }
  const fields = {
    ...lead,
    what_are_you_looking_for_: INTERESTS.service.hubspot,
    how_did_you_hear_about_us: pick(HEARD, b.heard),
    message: text(b.message, 5000),
  };

  try {
    const res = await submitHubSpotForm(FORM_ID, fields, {
      pageUri: pageUriFrom(b.pageUri, request.headers.get("referer")),
      pageName: "Service form",
      hutk: cleanHutk(b.hutk),
    });
    if (!res.ok) {
      console.error("contact: HubSpot returned", res.status, res.body);
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact: HubSpot unreachable", err);
    return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
  }
}
