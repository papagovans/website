/* Every Media Library photo on the site goes through here. It offers the
   browser each stored width in AVIF, then WebP for browsers without AVIF,
   and the browser downloads the smallest one that is sharp at the size the
   layout shows it. `sizes` is that display size; get it roughly right and the
   rest takes care of itself. */
import type { Media } from "@/payload-types";

const WIDTHS = ["thumb", "card", "large"] as const;
type Width = (typeof WIDTHS)[number];

export function Photo({
  m,
  sizes,
  max = "large",
  eager = false,
  className,
  alt,
}: {
  m: Media | number | null | undefined;
  sizes: string;
  max?: Width;
  eager?: boolean;
  className?: string;
  alt?: string;
}) {
  if (!m || typeof m !== "object" || !m.url) return null;
  const use = WIDTHS.slice(0, WIDTHS.indexOf(max) + 1);
  /* Where the layout can show a photo large, the master copy is offered as
     the biggest option whenever it is wider than every cut size. Without it,
     a 1,280px original has nothing above its 800px cut and would be shown
     soft. It is WebP inside the AVIF list, which is fine: every browser that
     reads AVIF reads WebP. */
  const set = (avif: boolean) => {
    const cuts = use
      .map((w) => m.sizes?.[avif ? (`${w}Avif` as const) : w])
      .filter((s): s is { url: string; width: number } => Boolean(s?.url && s?.width));
    const widest = cuts.at(-1)?.width ?? 0;
    if (max === "large" && m.width && m.width > widest) cuts.push({ url: m.url!, width: m.width });
    return cuts.map((s) => `${s.url} ${s.width}w`).join(", ");
  };
  const avif = set(true);
  const webp = set(false);
  const fallback = [...use].reverse().map((w) => m.sizes?.[w]?.url).find(Boolean) ?? m.url;

  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={sizes} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={className}
        src={fallback}
        srcSet={webp || undefined}
        sizes={webp ? sizes : undefined}
        alt={alt ?? m.alt}
        width={m.width ?? undefined}
        height={m.height ?? undefined}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
