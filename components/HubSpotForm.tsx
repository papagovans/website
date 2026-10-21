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
import { leadUser, trackLead } from "./Tracking";
import { CALENDAR_URL, QUIZ_FORM_ID, QUIZ_VANS } from "@/lib/site";
export { QUIZ_FORM_ID };

export const SALES_FORM_ID = "47d8947c-38d0-4d29-82a0-a37d2873d63f"; // 2026 New Contact Form - All Purpose
export const SERVICE_FORM_ID = "c2d5806e-8f73-4932-a720-f10ac6dbc66a"; // 2026 - Service Request
export const NEWSLETTER_FORM_ID = "b401718b-4c7c-4c5a-8bd7-8eaa0c46baca"; // footer signup, owner 2026-10-01
const PORTAL = "43782575";

type HsForm = { getFormId?: () => string; getFormFieldValues?: () => Promise<{ name: string; value: unknown }[]> };
type Values = { name: string; value: unknown }[];
const answer = (v: Values, prop: string) => String(v.find((f) => f.name.endsWith("/" + prop))?.value ?? "");

/* Owner 2026-10-20, "Let's see if a Papago fits": the sales form and the quiz
   offer Jeremy's calendar to a fit. Owner 2026-10-21: the only answer that
   isn't a fit is a budget under $140K (RV loan and "just looking" read as
   offensive). Answers that can't be read count as a fit, so a glitch never
   turns a buyer away. */
const isFit = (v: Values) => answer(v, "budget_including_the_van") !== "Under $140K";

/* The quiz's match: the dearest tier whose price, van included, fits under
   the top of the budget they picked. Tiers come in cheapest first, and each
   range since 2026-10-20 tops out just over one tier ($144K / $162K / $184K / $202K).
   ponytail: budget only, on the Sprinter allowance; add travel style or
   must-haves when the shop says which tier each one points to. */
const BUDGET_TOP: Record<string, number> = { "$140K - $160K": 160000, "$160K - $180K": 180000, "$180K - $200K": 200000, "$200K+": Infinity };
export type QuizTier = { path: string; name: string; tagline: string; total: number };
export const matchTier = (tiers: QuizTier[], budget: unknown) => tiers.filter((t) => t.total <= (BUDGET_TOP[String(budget)] ?? 0)).pop() ?? tiers[0];

/* card: "navy" for a form styled with white text, "light" for dark text, "none" to sit on the page as-is. */
export function HubSpotForm({ formId = SALES_FORM_ID, name = "contact_conversion", card = "navy", tiers = [] }: { formId?: string; name?: string; card?: "navy" | "light" | "none"; tiers?: QuizTier[] }) {
  const [result, setResult] = useState<"fit" | "not-yet">();
  const [match, setMatch] = useState<QuizTier>();
  useEffect(() => {
    /* The current embed announces a submission with a window event; older
       ones post a message. Either one counts once, and only for this form:
       a page can carry two (Contact Us has sales and service). */
    let sent = false;
    const lead = (e?: Event) => {
      const forms = (window as unknown as { HubSpotFormsV4?: { getFormFromEvent?: (e: Event) => HsForm } }).HubSpotFormsV4;
      const form = e ? forms?.getFormFromEvent?.(e) : undefined;
      const id = e ? form?.getFormId?.() : formId;
      if (id ? id !== formId : document.querySelectorAll(".hs-form-frame").length > 1) return;
      if (sent) return;
      sent = true;
      /* The lead is reported with what they typed when the form can say; a
         failed read still reports it, just without the matching data. */
      const values: Promise<Values> = form?.getFormFieldValues?.() ?? Promise.resolve([]);
      values.catch(() => []).then((v) => {
        trackLead(name, leadUser(v));
        if (formId !== SALES_FORM_ID && formId !== QUIZ_FORM_ID) return;
        const fit = isFit(v);
        setResult(fit ? "fit" : "not-yet");
        if (fit && formId === QUIZ_FORM_ID && tiers.length) setMatch(matchTier(tiers, answer(v, "budget_including_the_van")));
      });
    };
    /* An answer picked on the home page arrives as ?van=; tick it once the form is up. */
    const ready = (e: Event) => {
      const form = (window as unknown as { HubSpotFormsV4?: { getFormFromEvent?: (e: Event) => HsForm & { setFieldValue?: (name: string, value: string) => void } } }).HubSpotFormsV4?.getFormFromEvent?.(e);
      const van = QUIZ_VANS.find(([key]) => key === new URLSearchParams(location.search).get("van"));
      if (formId === QUIZ_FORM_ID && form?.getFormId?.() === QUIZ_FORM_ID && van) form.setFieldValue?.("0-1/van_options", van[2]);
    };
    window.addEventListener("hs-form-event:on-ready", ready);
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "hsFormCallback" && e.data?.eventName === "onFormSubmitted" && e.data?.id === formId) lead();
    };
    window.addEventListener("hs-form-event:on-submission:success", lead);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("hs-form-event:on-submission:success", lead);
      window.removeEventListener("hs-form-event:on-ready", ready);
      window.removeEventListener("message", onMessage);
    };
  }, [formId, name, tiers]);

  return (
    <>
      <Script src={`https://js.hsforms.net/forms/embed/${PORTAL}.js`} strategy="afterInteractive" />
      {/* HubSpot sizes .hs-form-frame to its form, so padding lives on the wrapper, not on it. */}
      <div className={card === "none" ? "hubspot-bare" : card === "light" ? "hubspot-form is-light" : "hubspot-form"}>
        <div className="hs-form-frame" data-region="na1" data-form-id={formId} data-portal-id={PORTAL} />
      </div>
      {match && <QuizMatch t={match} />}
      {result === "fit" && <BookJeremy scroll={!match} />}
      {result === "not-yet" && <NotYet />}
    </>
  );
}

function QuizMatch({ t }: { t: QuizTier }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => box.current?.scrollIntoView({ behavior: "smooth", block: "start" }), []);
  return (
    <div className="quiz-match" ref={box}>
      <p className="quiz-match-kicker">Your build match</p>
      <h3>{t.name}</h3>
      {t.tagline && <p className="quiz-match-tagline">{t.tagline}</p>}
      <p>Starts at <strong>${t.total.toLocaleString("en-US")}</strong>, van included.</p>
      <div className="quiz-match-ctas">
        <a href={t.path} className="btn btn-gold">See the {t.name} <span className="arw">&#8853;</span></a>
        <a href="/van-conversion-build-tiers/" className="btn btn-outline">Compare All Tiers</a>
      </div>
    </div>
  );
}

/* HubSpot's meetings embed. Its script scans for the container when it loads,
   so it is added after the container renders. No contact details ride in the
   URL; HubSpot recognises the visitor from its own cookie. */
export function BookJeremy({ scroll = true }: { scroll?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll) box.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const s = document.createElement("script");
    s.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    document.body.appendChild(s);
    return () => s.remove();
  }, [scroll]);
  return (
    <div className="book-jeremy" ref={box}>
      <h3>Looks like a fit. Pick a time with our Senior Build Consultant.</h3>
      <div className="meetings-iframe-container" data-src={`${CALENDAR_URL}?embed=true`} />
      <p className="book-jeremy-note">If something comes up, you can reschedule from your confirmation email.</p>
    </div>
  );
}

/* Owner 2026-10-20: the honest answer for anyone who isn't a fit yet. */
function NotYet() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => box.current?.scrollIntoView({ behavior: "smooth", block: "start" }), []);
  return (
    <div className="book-jeremy not-yet" ref={box}>
      <h3>Thanks. Here&rsquo;s the honest answer.</h3>
      <p>Based on what you told us, a Papago probably isn&rsquo;t the right move today. We&rsquo;d rather tell you now than six months into a wait.</p>
    </div>
  );
}
