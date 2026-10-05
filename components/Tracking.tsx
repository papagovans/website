/*
 * The same tracking papagovans.com runs, copied from it on 2026-09-26:
 *
 *   Google Tag Manager  GTM-M2K8LFSC   carries GA4 (G-QK4L7GQBL4), Google Ads
 *                                      (AW-11054135599, its conversion tags)
 *                                      and the Meta pixel (611277970549442).
 *   HubSpot tracking    portal 43782575, loaded by a WordPress plugin there.
 *
 * Nothing else is added here on purpose: GA4, Ads and Meta already fire from
 * inside the container, and a second copy on the page would count every
 * visit and every lead twice. Change what fires in GTM, not in this file.
 *
 * GTM is Google's own install, owner 2026-10-05: <GtmHead /> goes in <head>
 * and <GtmBody /> first in <body>, so Google's install checks find it. The
 * snippet inside is Google's, unchanged, wrapped in the host check below.
 *
 * It runs only on papagovans.com. Staging traffic (and every test signup)
 * would otherwise land in the live analytics and ad accounts, and cutover
 * switches it on with nothing to remember. To test on stage, open any page
 * with ?tracking=on: it stays on for that browser tab. GTM's own Preview
 * mode (?gtm_debug) works the same way.
 */
import Script from "next/script";

const GTM_ID = "GTM-M2K8LFSC";
const HUBSPOT_PORTAL = "43782575";

/* True on the live site, or in a tab that opted in with ?tracking=on. */
const isOn = `var h=location.hostname, k='papago-tracking', on = h==='papagovans.com' || h==='www.papagovans.com';
  try{ if(/[?&](tracking=on|gtm_debug)/.test(location.search)) sessionStorage.setItem(k,'on'); on = on || sessionStorage.getItem(k)==='on'; }catch(e){}`;

const gtm = `(function(){ ${isOn}
  if(!on) return;
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
})();`;

const hubspot = `(function(d){ ${isOn}
  if(!on) return;
  var s=d.createElement('script'); s.async=true; s.defer=true; s.id='hs-script-loader';
  s.src='https://js.hs-scripts.com/${HUBSPOT_PORTAL}.js';
  d.head.appendChild(s);
})(document);`;

/* Google Tag Manager, in <head>. A plain script, not next/script, so it is in the HTML Google checks. */
export function GtmHead() {
  return <script dangerouslySetInnerHTML={{ __html: gtm }} />;
}

/* Google Tag Manager (noscript), first thing in <body>. */
export function GtmBody() {
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
    </noscript>
  );
}

export function Tracking() {
  return <Script id="tracking" strategy="afterInteractive">{hubspot}</Script>;
}

/* Tells GTM a lead happened, as the event name GA4 and Google Ads expect.
   GTM decides what to do with it; this only reports it. */
export function trackLead(form: string) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  (w.dataLayer ??= []).push({ event: "generate_lead", form_name: form });
}
