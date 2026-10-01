import { NextResponse } from "next/server";
import { BUDGETS, HEARD, INTERESTS, TIMELINES } from "@/lib/contact";
import { cleanHutk, pageUriFrom, submitHubSpotForm } from "@/lib/hubspot";

/*
 * Contact form -> HubSpot. Two forms, because they ask different things:
 *
 *   sales    "2026 New Contact Form - All Purpose" (owner, 2026-10-01). Its
 *            id is public in any embed, so it lives here. Only its six fields
 *            are sent: HubSpot rejects a submission carrying a field the form
 *            does not have.
 *   service  the form in HUBSPOT_CONTACT_FORM_ID, unchanged:
 *              vercel env add HUBSPOT_CONTACT_FORM_ID --scope papago
 *            Until it is set a service request answers 503 and the form says
 *            to call, rather than reporting success over a dropped lead.
 *
 * Spam: a hidden field people never fill and a minimum time on the form.
 * A bot that trips either is told it succeeded, so it learns nothing.
 */
const SALES_FORM_ID = "47d8947c-38d0-4d29-82a0-a37d2873d63f";
const SERVICE_FORM_ID = process.env.HUBSPOT_CONTACT_FORM_ID;
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

  const service = b.interest === "service";
  const lead = {
    firstname: text(b.firstname, 80),
    lastname: text(b.lastname, 80),
    email: text(b.email, 200),
    phone: text(b.phone, 40),
  };
  const budget = pick(BUDGETS, b.budget);
  if (!lead.firstname || !lead.lastname || !looksLikeEmail(lead.email) || lead.phone.replace(/\D/g, "").length < 7 || (!service && !budget)) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const formId = service ? SERVICE_FORM_ID : SALES_FORM_ID;
  if (!formId) {
    console.warn("contact: HUBSPOT_CONTACT_FORM_ID is not set, service request not delivered");
    return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }
  const fields = service
    ? {
        ...lead,
        what_are_you_looking_for_: INTERESTS.service.hubspot,
        how_did_you_hear_about_us: pick(HEARD, b.heard),
        message: text(b.message, 5000),
      }
    : { ...lead, budget_including_the_van: budget, timeline: pick(TIMELINES, b.timeline) };

  try {
    const res = await submitHubSpotForm(formId, fields, {
      pageUri: pageUriFrom(b.pageUri, request.headers.get("referer")),
      pageName: service ? "Service form" : "Contact form",
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
