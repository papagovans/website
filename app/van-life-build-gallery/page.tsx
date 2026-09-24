import type { Metadata } from "next";
import { listProjectCards } from "@/lib/content";
import "./gallery.css";

export const metadata: Metadata = {
  title: "Van Life Build Gallery | Papago Vans",
  description:
    "Every custom Mercedes-Benz Sprinter camper van conversion Papago Vans has built in Mesa, Arizona. Browse finished builds, floor plans and photography.",
};

export default async function GalleryPage() {
  const cards = await listProjectCards();
  return (
    <div className="gal wrap">
      <p className="gal-eyebrow">Build Gallery</p>
      <h1>Vans We Have Built</h1>
      <p className="gal-lede">
        {cards.length} finished conversions, every one built by hand in Mesa, Arizona.
        Yours would be next.
      </p>

      <div className="gal-grid">
        {cards.map((c, i) => (
          <a className="gal-card" href={c.path} key={c.slug}>
            <picture>
              <source srcSet={c.thumb_avif} type="image/avif" />
              <source srcSet={c.thumb_webp} type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.thumb_webp} alt={c.alt} loading={i < 6 ? "eager" : "lazy"} decoding="async" />
            </picture>
            <h2>{c.title}</h2>
          </a>
        ))}
      </div>
    </div>
  );
}
