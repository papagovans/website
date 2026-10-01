"use client";
/*
 * The contact form. Posts to /api/contact, which forwards to HubSpot.
 *
 * Two shapes. Sales (the default) asks exactly what HubSpot's "2026 New
 * Contact Form - All Purpose" holds: name, email, phone, budget including the
 * van (required there, so required here) and timeline. The service page
 * (preset "service") asks what the van needs instead, and is never asked a
 * build budget.
 */
import { useRef, useState } from "react";
import { BUDGETS, HEARD, TIMELINES, type Interest } from "@/lib/contact";
import { SALES_PHONE, SERVICE_PHONE, tel } from "@/lib/site";
import { trackLead } from "./Tracking";

type State = "idle" | "sending" | "done" | "error" | "invalid";

export function ContactForm({ preset }: { preset?: Interest | null }) {
  const [state, setState] = useState<State>("idle");
  const interest: Interest = preset === "service" ? "service" : "conversion";
  const [first, setFirst] = useState("");
  const opened = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setState("invalid");
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    setState("sending");
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          elapsed: Date.now() - opened.current,
          pageUri: location.href,
          hutk: document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/)?.[1],
        }),
      });
      if (res.ok) {
        setFirst(String(data.firstname ?? ""));
        setState("done");
        trackLead(`contact_${interest}`);
      } else setState(res.status === 400 ? "invalid" : "error");
    } catch {
      setState("error");
    }
  }

  const phone = interest === "service" ? SERVICE_PHONE : SALES_PHONE;

  if (state === "done") {
    return (
      <div className="contact-done" role="status">
        <h3>Thanks{first ? `, ${first}` : ""}. It is on its way to the shop.</h3>
        <p>
          Someone will be in touch soon. If it cannot wait, call{" "}
          <a href={tel(phone)}>{phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {/* A trap for bots: hidden from people and from screen readers. */}
      <div className="contact-trap" aria-hidden="true">
        <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="contact-row">
        <label className="contact-field">
          <span>First name *</span>
          <input name="firstname" autoComplete="given-name" required />
        </label>
        <label className="contact-field">
          <span>Last name *</span>
          <input name="lastname" autoComplete="family-name" required />
        </label>
      </div>
      <div className="contact-row">
        <label className="contact-field">
          <span>Email *</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required />
        </label>
        <label className="contact-field">
          <span>Phone *</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={7} />
        </label>
      </div>

      <input type="hidden" name="interest" value={interest} />

      {interest === "conversion" ? (
        <div className="contact-row">
          <label className="contact-field">
            <span>Overall budget, including the van *</span>
            <select name="budget" defaultValue="" required>
              <option value="" disabled>Choose a range</option>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="contact-field">
            <span>What&apos;s your timeline?</span>
            <select name="timeline" defaultValue="">
              <option value="" disabled>Choose one</option>
              {TIMELINES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
      ) : (
        <>
          <label className="contact-field">
            <span>What does your van need?</span>
            <textarea name="message" rows={5} maxLength={5000} />
          </label>
          <label className="contact-field contact-narrow">
            <span>How did you find us?</span>
            <select name="heard" defaultValue="">
              <option value="">Choose one</option>
              {HEARD.map((h) => <option key={h} value={h}>{h === "Youtube" ? "YouTube" : h}</option>)}
            </select>
          </label>
        </>
      )}

      <button className="btn btn-gold" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send"}
        {state !== "sending" && <span className="arw">&#8853;</span>}
      </button>

      {state === "invalid" && <p className="contact-error" role="alert">Please fill in the fields marked with a star.</p>}
      {state === "error" && (
        <p className="contact-error" role="alert">
          That did not go through. Try again, or call <a href={tel(phone)}>{phone}</a>.
        </p>
      )}
    </form>
  );
}
