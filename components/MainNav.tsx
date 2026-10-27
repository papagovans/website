"use client";
/* The desktop nav. On the home page (owner 2026-10-27, home first, after
   geotrekvans.com) Build Tiers and About open wide panels: every tier as a
   photo card with its van-included price, and About's pages each with one
   line on what is there. Every other page keeps the plain About drop-down
   until the owner signs off. Panels open on hover or keyboard focus, in CSS,
   the same way the plain drop-down always has; the top-level links still go
   to their pages. */
import { usePathname } from "next/navigation";
import { Photo } from "@/components/Photo";
import type { Media } from "@/payload-types";
import { BUILD_LINK, QUIZ_PATH } from "@/lib/site";

export type NavTier = { path: string; name: string; tagline: string; total: number; photo: Media | null };

const ABOUT: [string, string, string][] = [
  ["About Us", "/about-us/", "Veteran owned, one shop in Mesa"],
  ["Our Process", "/our-process/", "Ten steps from first call to keys"],
  ["Our Team", "/about-us/#our-team", "The people who build your van"],
  ["Service Department", "/service-department/", "Repairs and upgrades on any van"],
  ["FAQ", "/faq/", "Cost, power, bathrooms, timelines"],
  ["Guides", "/blog/", "Van life and build advice"],
];

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const ext = BUILD_LINK.external ? { target: "_blank", rel: "noopener" } : {};

export function MainNav({ tiers }: { tiers: NavTier[] }) {
  const mega = usePathname() === "/";
  const caret = <span className="nav-caret" aria-hidden="true">&#9662;</span>;

  return (
    <nav className={mega ? "main-nav has-mega" : "main-nav"} aria-label="Main">
      {mega && tiers.length ? (
        <div className="nav-drop is-mega">
          <a href={BUILD_LINK.href} aria-haspopup="true" {...ext}>{BUILD_LINK.text} {caret}</a>
          <div className="mega">
            <div className="mega-card">
              <div className="mega-tiers">
                {tiers.map((t) => (
                  <a key={t.path} href={t.path} className="mega-tier">
                    <Photo m={t.photo} sizes="300px" max="card" className="mega-tier-img" alt="" />
                    <span className="mega-tier-text">
                      <span className="mega-tier-name">{t.name}</span>
                      {t.tagline && <span className="mega-tier-tag">{t.tagline}</span>}
                      <span className="mega-tier-price">From {usd(t.total)}, van included</span>
                    </span>
                    <span className="mega-tier-go">Explore &rarr;</span>
                  </a>
                ))}
              </div>
              <div className="mega-strip">
                <a href={QUIZ_PATH} className="btn btn-gold btn-sm">Which Build Fits You? <span className="arw">&#8853;</span></a>
                <span className="mega-strip-links">
                  <a href="/van-conversion-build-tiers/">Compare Tiers</a>
                  <a href="/bespoke/">Bespoke Builds</a>
                  <a href="/financing/">Financing</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <a href={BUILD_LINK.href} {...ext}>{BUILD_LINK.text}</a>
      )}
      <a href="/van-life-build-gallery/">Recent Builds</a>
      {mega ? (
        <div className="nav-drop is-mega">
          <a href="/about-us/" aria-haspopup="true">About {caret}</a>
          <div className="mega">
            <div className="mega-card mega-about">
              {ABOUT.map(([label, href, line]) => (
                <a key={href} href={href} className="mega-link">
                  <span className="mega-link-name">{label}</span>
                  <span className="mega-link-line">{line}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="nav-drop">
          <a href="/about-us/" aria-haspopup="true">About {caret}</a>
          <div className="nav-menu">
            <a href="/our-process/">Our Process</a>
            <a href="/about-us/#our-team">Our Team</a>
          </div>
        </div>
      )}
      <a href="/contact-us/">Contact</a>
    </nav>
  );
}
