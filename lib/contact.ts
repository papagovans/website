/* The service request form's choices, shared by the form and the route that
   checks it, each mapped to the value HubSpot stores. Sales enquiries use
   HubSpot's own form, so their choices live in HubSpot. */
export const INTERESTS = {
  service: { label: "Service or repair", hubspot: "YglkcQT9i5n5u6EBPBJuc" },
} as const;

/* The values of HubSpot's how_did_you_hear_about_us property, exactly. */
export const HEARD = ["Google", "Facebook", "Instagram", "TikTok", "Youtube", "Other"] as const;
