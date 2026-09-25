"use client";

import { useEffect, useRef, useState } from "react";

/*
 * HubSpot form embed for the newsletter band.
 *
 * Every form on this site is a HubSpot form, so signups land in the CRM with a
 * source property rather than in a second system that nobody reconciles.
 *
 * The form id comes from NEXT_PUBLIC_HUBSPOT_NEWSLETTER_FORM_ID so it can be
 * set in Vercel without a deploy. Until it is set the band falls back to the
 * phone number, which is a real thing a reader can do, rather than rendering a
 * dead input.
 */

const PORTAL_ID = "43782575";
const FORM_ID = process.env.NEXT_PUBLIC_HUBSPOT_NEWSLETTER_FORM_ID;

declare global {
  interface Window {
    hbspt?: { forms: { create: (o: Record<string, unknown>) => void } };
  }
}

export default function NewsletterForm() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!FORM_ID || !host.current) return;
    const target = `#${host.current.id}`;

    const create = () => {
      if (!window.hbspt) return setFailed(true);
      window.hbspt.forms.create({ portalId: PORTAL_ID, formId: FORM_ID, region: "na1", target });
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-hsforms]");
    if (existing) return create();

    const s = document.createElement("script");
    s.src = "https://js.hsforms.net/forms/embed/v2.js";
    s.async = true;
    s.dataset.hsforms = "true";
    s.onload = create;
    s.onerror = () => setFailed(true);
    document.body.appendChild(s);
  }, []);

  if (!FORM_ID || failed) {
    return (
      <a href="tel:+16023460331" className="btn btn-gold">
        Call +1 602-346-0331 <span className="arw">&#8853;</span>
      </a>
    );
  }
  return <div id="hs-newsletter" className="kit-form" ref={host} />;
}
