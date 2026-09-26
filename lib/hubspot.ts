/*
 * Submits to a HubSpot form rather than the CRM API: a form submission needs
 * no private app token, so nothing secret lives in this repo, and whoever owns
 * the form can change its notifications and follow-up without a deploy.
 *
 * Field names must be real HubSpot contact properties. HubSpot accepts an
 * unknown name without complaint and drops it, which is how papago_lead_source
 * went unrecorded for as long as it did.
 *
 * Which form someone came through needs no field at all: HubSpot records it
 * as the contact's First and Recent conversion, named after the form. Do not
 * write lead_source from the website. It holds the Meta lead-ad campaign on
 * ~11,000 contacts, and a later website signup would overwrite it.
 */
import "server-only";

export const HUBSPOT_PORTAL = process.env.HUBSPOT_PORTAL_ID ?? "43782575";

/* HubSpot's visitor cookie: a 32-character hex id, nothing else accepted.
   It ties the submission to the pages this person browsed. */
export const cleanHutk = (v: unknown) => (/^[a-f0-9]{32}$/.test(String(v ?? "")) ? String(v) : undefined);

/* Only our own pages count as the page a form was sent from. */
export function pageUriFrom(v: unknown, fallback: string | null) {
  const s = String(v ?? fallback ?? "");
  try {
    const u = new URL(s);
    return /(^|\.)papagovans\.com$/.test(u.hostname) || u.hostname === "localhost" ? u.href : "";
  } catch {
    return "";
  }
}

export async function submitHubSpotForm(
  formId: string,
  fields: Record<string, string | undefined>,
  context: { pageUri: string; pageName: string; hutk?: string },
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL}/${formId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fields: Object.entries(fields)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([name, value]) => ({ objectTypeId: "0-1", name, value })),
      context: { pageUri: context.pageUri, pageName: context.pageName, ...(context.hutk ? { hutk: context.hutk } : {}) },
    }),
  });
  return res.ok ? { ok: true } : { ok: false, status: res.status, body: await res.text() };
}
