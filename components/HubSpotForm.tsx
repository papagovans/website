"use client";
/*
 * HubSpot's own form, embedded the way papagovans.com embedded it: whatever
 * is changed in HubSpot (fields, options, follow-up) shows here with no
 * deploy. Owner, 2026-10-01: "2026 New Contact Form - All Purpose" is the
 * one form for sales enquiries, replacing the old quiz and the site's own
 * contact form.
 *
 * A submission still tells GTM a lead happened (generate_lead), the same
 * event the site's own form sent, so nothing downstream has to change.
 */
import Script from "next/script";
import { useEffect } from "react";
import { trackLead } from "./Tracking";

export const SALES_FORM_ID = "47d8947c-38d0-4d29-82a0-a37d2873d63f";
const PORTAL = "43782575";

export function HubSpotForm({ formId = SALES_FORM_ID, name = "contact_conversion" }: { formId?: string; name?: string }) {
  useEffect(() => {
    /* The current embed announces a submission with a window event; older
       ones post a message. Either one counts once. */
    let sent = false;
    const lead = () => {
      if (sent) return;
      sent = true;
      trackLead(name);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "hsFormCallback" && e.data?.eventName === "onFormSubmitted" && e.data?.id === formId) lead();
    };
    window.addEventListener("hs-form-event:on-submission:success", lead);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("hs-form-event:on-submission:success", lead);
      window.removeEventListener("message", onMessage);
    };
  }, [formId, name]);

  return (
    <>
      <Script src={`https://js.hsforms.net/forms/embed/${PORTAL}.js`} strategy="afterInteractive" />
      {/* HubSpot sizes .hs-form-frame to its form, so padding lives on the wrapper, not on it. */}
      <div className="hubspot-form">
        <div className="hs-form-frame" data-region="na1" data-form-id={formId} data-portal-id={PORTAL} />
      </div>
    </>
  );
}
