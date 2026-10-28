/* Link previews and the canonical address, for every page (owner 2026-10-28).
   Next replaces a parent's openGraph wholesale rather than merging it, so each
   page builds its whole set here instead of leaning on the layout. The
   canonical is the bare path, so ?fbclid=, ?utm_ and ?van= variants all point
   Google back at the one page. */
import type { Metadata } from "next";
import type { Media } from "@/payload-types";

export const DEFAULT_TITLE = "Arizona Campervan Conversions | Custom Vans by Papago";
export const DEFAULT_DESCRIPTION =
  "Rugged, high-performance camper van conversions on the Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster, built by hand in Mesa, Arizona.";
export const DEFAULT_SHARE_IMAGE = "/home/Northrop-Sprinter-144-Final-Pics-30-Large.jpeg";

/* The first photo anywhere in a page's content, for pages that have no
   single hero field: tier pages, About, the rest of the CMS pages. */
export function firstPhoto(v: unknown): Media | null {
  if (!v || typeof v !== "object") return null;
  const m = v as Media;
  if (typeof m.url === "string" && m.mimeType?.startsWith("image/")) return m;
  for (const x of Object.values(v)) {
    const hit = firstPhoto(x);
    if (hit) return hit;
  }
  return null;
}

export function seo(path: string, title: string, description: string | null | undefined, photo?: Media | null): Metadata {
  const image = photo?.sizes?.large?.url ?? photo?.url ?? DEFAULT_SHARE_IMAGE;
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Papago Vans",
      url: path,
      title,
      description: description ?? undefined,
      images: [{ url: image, alt: photo?.alt ?? "A Papago Vans camper van conversion" }],
    },
    twitter: { card: "summary_large_image" },
  };
}
