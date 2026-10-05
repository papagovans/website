"use client";
/*
 * HubSpot's own form, embedded the way papagovans.com embedded it: whatever
 * is changed in HubSpot (fields, options, follow-up) shows here with no
 * deploy. Owner, 2026-10-01: "2026 New Contact Form - All Purpose" is the
 * one form for sales enquiries, replacing the old quiz and the site's own
 * contact form; "2026 - Service Request" is the one for service.
 *
 * A submission still tells GTM a lead happened (generate_lead), the same
 * event the site's own form sent, so nothing downstream has to change.
 */
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { trackLead } from "./Tracking";
import { CALENDAR_URL } from "@/lib/site";

export const SALES_FORM_ID = "47d8947c-38d0-4d29-82a0-a37d2873d63f"; // 2026 New Contact Form - All Purpose
export const SERVICE_FORM_ID = "c2d5806e-8f73-4932-a720-f10ac6dbc66a"; // 2026 - Service Request
export const NEWSLETTER_FORM_ID = "b401718b-4c7c-4c5a-8bd7-8eaa0c46baca"; // footer signup, owner 2026-10-01
const PORTAL = "43782575";

/* Owner 2026-10-05: a buyer who picks $170K or more on the sales form is
   offered Jeremy's calendar right away; everyone else goes to an SDR.
   Stored values, not labels: "$170K - $200K" and "$200K+". */
export const wantsCalendar = (budget: unknown) => /^\$(170|200)K/.test(String(budget ?? ""));
type HsForm = { getFormId?: () => string; getFormFieldValues?: () => Promise<{ name: string; value: unknown }[]> };

/* card: "navy" for a form styled with white text, "light" for dark text, "none" to sit on the page as-is. */
export function HubSpotForm({ formId = SALES_FORM_ID, name = "contact_conversion", card = "navy" }: { formId?: string; name?: string; card?: "navy" | "light" | "none" }) {
  useEffect(() => {
    /* The current embed announces a submission with a window event; older
       ones post a message. Either one counts once, and only for this form:
       a page can carry two (Contact Us has sales and service). */
    let sent = false;
    const lead = (e?: Event) => {
      const forms = (window as unknown as { HubSpotFormsV4?: { getFormFromEvent?: (e: Event) => { getFormId?: () => string } } }).HubSpotFormsV4;
      const id = e ? forms?.getFormFromEvent?.(e)?.getFormId?.() : formId;
      if (id ? id !== formId : document.querySelectorAll(".hs-form-frame").length > 1) return;
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
      <div className={card === "none" ? "hubspot-bare" : card === "light" ? "hubspot-form is-light" : "hubspot-form"}>
        <div className="hs-form-frame" data-region="na1" data-form-id={formId} data-portal-id={PORTAL} />
      </div>
    </>
  );
}

/* HubSpot's meetings embed. Its script scans for the container when it loads,
   so it is added after the container renders. No contact details ride in the
   URL; HubSpot recognises the visitor from its own cookie. */
export function BookJeremy() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const s = document.createElement("script");
    s.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    document.body.appendChild(s);
    return () => s.remove();
  }, []);
  return (
    <div className="book-jeremy" ref={box}>
      <h3>Skip the Wait. Book Your Call With Jeremy.</h3>
      <p>Jeremy runs sales at Papago. Pick a time that works and he will call you to talk through your build, your budget and your timing.</p>
      <div className="meetings-iframe-container" data-src={`${CALENDAR_URL}?embed=true`} />
    </div>
  );
}
