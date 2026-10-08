/*
 * Facts about the business that more than one page needs.
 *
 * Phone numbers, the address and the email are what papagovans.com publishes
 * today, confirmed against its live Contact page rather than copied from the
 * staging build, which carries a single number Ivio introduced and which does
 * not appear anywhere on the live site. If the sales line has genuinely moved,
 * change it here and every page follows.
 */
export const SALES_PHONE = "(480) 761-7175";
/* One number for sales and service since 2026-10-08 (owner); the old service
   line was (520) 666-4283. Kept as its own name so "Service phone" buttons in
   the CMS keep working, and can split again with one edit. */
export const SERVICE_PHONE = SALES_PHONE;
export const EMAIL = "info@papagovans.com";
export const ADDRESS_LINE1 = "751 N Country Club Dr";
export const ADDRESS_LINE2 = "Mesa, AZ 85201";
export const MAP_URL =
  "https://maps.google.com/?q=751+N+Country+Club+Dr,+Mesa,+AZ+85201";
/* Jeremy's HubSpot scheduling page, "Custom Van Build Consultation" (owner
   2026-10-05: HubSpot only, no Calendly). Bookings land on the contact in HubSpot. */
export const CALENDAR_URL = "https://meetings.hubspot.com/jeremy-piccirillo";
/* The "Which Build Fits You?" quiz page. Question one is also asked on the
   home page (Quiz Starter): ?van=<key> on the quiz page ticks the answer. The
   value must be HubSpot's stored value for van_options. */
export const QUIZ_FORM_ID = "d85f2b90-5a81-49c9-8972-a55b714287fe"; // HubSpot "2026 - Which Build Fits You", owner 2026-10-05
export const QUIZ_PATH = "/which-build-fits-you/";
export const QUIZ_VANS: [key: string, label: string, value: string][] = [
  ["sprinter", "Mercedes Sprinter", "Mercedes Sprinter"],
  ["transit", "Ford Transit", "Ford Transit"],
  ["promaster", "Ram ProMaster", "RAM Promaster"],
  ["unsure", "Not sure yet", "I'm Not Sure Yet!"],
];
/* The live site. Search engines may crawl only these hosts (app/robots.ts,
   next.config.ts); every other host, staging included, is noindex. */
export const SITE_URL = "https://papagovans.com";
export const LIVE_HOSTS = ["papagovans.com", "www.papagovans.com"];
export const BUILD_APP = "https://build.papagovans.com";
/* The builder is paused (owner, 2026-10-01) while its new pricing waits. Off,
   every "Build Your Van" link on the site, menus and CMS buttons alike, goes
   to the build tiers page instead. Set true and they all go back at once. */
export const BUILDER_LIVE = false;
export const BUILD_LINK = BUILDER_LIVE
  ? { href: BUILD_APP, text: "Build Your Van", external: true }
  : { href: "/van-conversion-build-tiers/", text: "Build Tiers", external: false };

/** Digits only, for tel: links. */
export const tel = (n: string) => `tel:+1${n.replace(/\D/g, "")}`;

/* Real profiles, read off the live site's footer. The rebuild shipped four
   placeholder letters pointing at "#". */
export const SOCIALS: [string, string, string][] = [
  ["Facebook", "f", "https://www.facebook.com/Papagovans/"],
  ["Instagram", "ig", "https://www.instagram.com/papagovans/"],
  ["TikTok", "tt", "https://www.tiktok.com/@papagovans"],
  ["YouTube", "yt", "https://www.youtube.com/@papagovans"],
];

/* Where a CMS button or highlighted line can point. Staff pick one by name
   instead of typing a phone number or calendar link, so a number that changes
   here changes on every page at once. */
export const DESTINATIONS = {
  calendar: { label: "Jeremy's calendar (book a call)", href: CALENDAR_URL, text: "Schedule A Call", external: true },
  sales: { label: "Sales phone", href: tel(SALES_PHONE), text: SALES_PHONE, external: false },
  service: { label: "Service phone", href: tel(SERVICE_PHONE), text: SERVICE_PHONE, external: false },
  email: { label: "Email", href: `mailto:${EMAIL}`, text: EMAIL, external: false },
  map: { label: "Shop address (map)", href: MAP_URL, text: `${ADDRESS_LINE1}, ${ADDRESS_LINE2}`, external: true },
  builder: { label: BUILDER_LIVE ? "Van builder" : "Van builder (paused, goes to Build Tiers)", ...BUILD_LINK },
} as const;
export type Destination = keyof typeof DESTINATIONS;
