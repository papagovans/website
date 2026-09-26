"use client";

import { useState } from "react";
import { SALES_PHONE, tel } from "@/lib/site";

/*
 * Newsletter band, on every page above the footer.
 *
 * One field, asking for one thing. The previous version embedded HubSpot's own
 * form script, which meant a third-party stylesheet inside our band and a
 * layout we did not control; this posts to /api/newsletter, which forwards to
 * the same HubSpot form server side.
 *
 * Four states, and the failure one tells the truth rather than showing a tick
 * over a dropped address. Until HUBSPOT_NEWSLETTER_FORM_ID is set in Vercel
 * every submission lands there, which is deliberate: it is visible the first
 * time anyone tests it.
 */

type State = "idle" | "sending" | "done" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="kit-done" role="status">
        You are on the list. We will not email you often, and never about anything
        other than vans.
      </p>
    );
  }

  return (
    <form className="kit-form" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor="kit-email">Email address</label>
      <input
        id="kit-email"
        className="kit-input"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
        aria-invalid={state === "error" || undefined}
      />
      <button className="btn btn-gold" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Signing up…" : "Sign Up"}
        {state !== "sending" && <span className="arw">&#8853;</span>}
      </button>

      {state === "error" && (
        <p className="kit-error" role="alert">
          That did not go through. Try again, or call{" "}
          <a href={tel(SALES_PHONE)}>{SALES_PHONE}</a>.
        </p>
      )}
    </form>
  );
}
