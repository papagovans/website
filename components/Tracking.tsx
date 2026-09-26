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
 * It runs only on papagovans.com. Staging traffic (and every test signup)
 * would otherwise land in the live analytics and ad accounts, and cutover
 * switches it on with nothing to remember. To test on stage, open any page
 * with ?tracking=on: it stays on for that browser tab. GTM's own Preview
 * mode (?gtm_debug) works the same way.
 */
import Script from "next/script";

const GTM_ID = "GTM-M2K8LFSC";
const HUBSPOT_PORTAL = "43782575";

const loader = `(function(w,d){
  var h=location.hostname, q=location.search, k='papago-tracking';
  try{ if(/[?&](tracking=on|gtm_debug)/.test(q)) sessionStorage.setItem(k,'on'); }catch(e){}
  var live = h==='papagovans.com' || h==='www.papagovans.com';
  var test = false; try{ test = sessionStorage.getItem(k)==='on'; }catch(e){}
  if(!live && !test) return;
  w.dataLayer=w.dataLayer||[]; w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  var g=d.createElement('script'); g.async=true; g.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
  d.head.appendChild(g);
  var s=d.createElement('script'); s.async=true; s.defer=true; s.id='hs-script-loader';
  s.src='https://js.hs-scripts.com/${HUBSPOT_PORTAL}.js';
  d.head.appendChild(s);
})(window,document);`;

export function Tracking() {
  return <Script id="tracking" strategy="afterInteractive">{loader}</Script>;
}

/* Tells GTM a lead happened, as the event name GA4 and Google Ads expect.
   GTM decides what to do with it; this only reports it. */
export function trackLead(form: string) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  (w.dataLayer ??= []).push({ event: "generate_lead", form_name: form });
}
