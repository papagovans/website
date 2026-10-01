/* The contact form's choices, shared by the form and the route that checks
   it. A sales enquiry goes to HubSpot's "2026 New Contact Form - All
   Purpose" (owner, 2026-10-01), so its budgets are that form's options,
   exactly; HubSpot rejects anything else. Service enquiries keep their own
   form and use INTERESTS. */
export const INTERESTS = {
  conversion: { label: "Camper van conversion", hubspot: "QEWMD24fVazMRnLW0g39P" },
  service: { label: "Service or repair", hubspot: "YglkcQT9i5n5u6EBPBJuc" },
} as const;
export type Interest = keyof typeof INTERESTS;

export const BUDGETS = ["$150K - $170K", "$170K - $200K", "$200K+"] as const;
export const TIMELINES = ["ASAP", "1 - 3 months", "3 - 6 months", "6 - 12 months", "12+ months", "No timeline if it's the right fit"] as const;
/* The values of HubSpot's how_did_you_hear_about_us property, exactly. */
export const HEARD = ["Google", "Facebook", "Instagram", "TikTok", "Youtube", "Other"] as const;
