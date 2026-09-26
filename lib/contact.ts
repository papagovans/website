/* The contact form's choices, shared by the form and the route that checks
   it, each mapped to the value HubSpot stores. Budgets follow the site's
   pricing: Tailored $180k-$250k, Bespoke $250k-$350k, van included. */
export const INTERESTS = {
  conversion: { label: "Camper van conversion", hubspot: "QEWMD24fVazMRnLW0g39P" },
  service: { label: "Service or repair", hubspot: "YglkcQT9i5n5u6EBPBJuc" },
} as const;
export type Interest = keyof typeof INTERESTS;

export const BUDGETS = ["$180k - $200k", "$200k - $250k", "$250k - $300k", "$300k - $350k", "$350k+", "Not sure yet"] as const;
export const TIMELINES = ["ASAP", "1 - 3 months", "3 - 6 months", "6 - 12 months", "12+ months", "No timeline if it's the right fit"] as const;
/* The values of HubSpot's how_did_you_hear_about_us property, exactly. */
export const HEARD = ["Google", "Facebook", "Instagram", "TikTok", "Youtube", "Other"] as const;
