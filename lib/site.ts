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
export const SERVICE_PHONE = "(520) 666-4283";
export const EMAIL = "info@papagovans.com";
export const ADDRESS_LINE1 = "751 N Country Club Dr";
export const ADDRESS_LINE2 = "Mesa, AZ 85201";
export const MAP_URL =
  "https://maps.google.com/?q=751+N+Country+Club+Dr,+Mesa,+AZ+85201";
export const CALENDAR_URL = "https://calendly.com/jeremy-papago/30min";
export const BUILD_APP = "https://build.papagovans.com";

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
  builder: { label: "Van builder", href: BUILD_APP, text: "Build Your Van", external: true },
} as const;
export type Destination = keyof typeof DESTINATIONS;
