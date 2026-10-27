import type { Metadata } from "next";
import { inter, prompt } from "@/lib/fonts";
import "./globals.css";
import { HubSpotForm, NEWSLETTER_FORM_ID } from "@/components/HubSpotForm";
import { LoadedFlag } from "@/components/LoadedFlag";
import { ScrolledFlag } from "@/components/ScrolledFlag";
import { GtmBody, GtmHead, Tracking } from "@/components/Tracking";
import { MobileMenu } from "@/components/MobileMenu";
import { MainNav } from "@/components/MainNav";
import { cachedTierLinks } from "@/lib/content";
import type { Media } from "@/payload-types";
import {
  SALES_PHONE, EMAIL, ADDRESS_LINE1, ADDRESS_LINE2,
  MAP_URL, CONTACT_FORM_URL, BUILD_LINK, SOCIALS, SITE_URL, tel,
} from "@/lib/site";

/*
 * Shared shell, ported from the Astro mockup at go.papagovans.com/home.
 *
 * Header, newsletter band and footer live here so a second page cannot drift
 * from the first. Search engines may index papagovans.com only: every other
 * host (stage, previews) gets a noindex response header from next.config.ts.
 * No robots tag here, or the live site would carry it too.
 *
 * Footer links are still href="#": those pages are not built yet. The header
 * nav points at the only two doors the site has, the configurator and the
 * gallery, because lead capture is the configurator and Calendly, nothing else.
 * Footer links become real routes as pages
 * land. Content moves into Payload once there is something worth editing.
 */

/* The header phone is the sales line, the same number the live site has
   published for years. It and the booking link both come from lib/site. */

/* Every link here used to be href="#", which put twenty dead links on every
   page of the site. They point at real pages now; anything still without one
   is not listed rather than listed and broken. */
const footerCols = [
  {
    h: "Campers",
    links: [
      ["El Capitan", "/el-capitan-luxury-van-build/"],
      ["Zion", "/zion/"],
      ["Olympus", "/olympus/"],
      ["McKinley", "/mckinley/"],
    ],
  },
  {
    h: "Explore",
    links: [
      [BUILD_LINK.text, BUILD_LINK.href],
      ["Build Gallery", "/van-life-build-gallery/"],
      ["Our Process", "/our-process/"],
      ["Bespoke Builds", "/bespoke/"],
      ["Blog", "/blog/"],
    ],
  },
  {
    h: "Company",
    links: [
      ["About Us", "/about-us/"],
      ["Service Department", "/service-department/"],
      ["Financing", "/financing/"],
      ["FAQ", "/faq/"],
      ["Careers", "/work-at-papago-vans/"],
      ["Contact Us", "/contact-us/"],
    ],
  },
  {
    h: "Vans We Convert",
    links: [
      ["Mercedes Sprinter", "/mercedes-sprinter/"],
      ["Ram ProMaster", "/ram-promaster/"],
      ["Ford Transit", "/ford-transit/"],
    ],
  },
];

export const metadata: Metadata = {
  title: "Arizona Campervan Conversions | Custom Vans by Papago",
  description:
    "Rugged, high-performance camper van conversions on the Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster, built by hand in Mesa, Arizona.",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* For the Build Tiers menu panel: every tier with its photo and price.
     The header ships on every page, so each photo carries only the two small
     cuts the panel shows, not the whole Media record. */
  const tiers = (await cachedTierLinks()).map((t) => {
    const p = t.photo;
    const cut = (k: "thumb" | "card" | "thumbAvif" | "cardAvif") => p?.sizes?.[k] && { url: p.sizes[k].url, width: p.sizes[k].width };
    return { ...t, photo: p && ({ url: p.url, width: p.width, alt: p.alt, sizes: { thumb: cut("thumb"), card: cut("card"), thumbAvif: cut("thumbAvif"), cardAvif: cut("cardAvif") } } as unknown as Media) };
  });
  return (
    <html lang="en" className={`${inter.variable} ${prompt.variable}`}>
      <head>
        <GtmHead />
      </head>
      <body>
        <GtmBody />
        <LoadedFlag />
        <ScrolledFlag />
        <Tracking />
        {/* Who and where the business is, on every page. It used to sit on
            Contact alone; now that Contact is a CMS page, the layout owns it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutomotiveBusiness",
              name: "Papago Vans",
              // Owner 2026-10-20 (AI search): who we are, where, what it costs
              // and where else we live online. Prices are the published ones.
              url: SITE_URL,
              logo: `${SITE_URL}/home/Group-278.svg`,
              description: "Custom camper van conversions on the Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster, built by hand in our own shop in Mesa, Arizona. RVIA certified, veteran owned.",
              priceRange: "$144,295 to $350,000, van included",
              areaServed: ["Arizona", "United States"],
              sameAs: SOCIALS.map(([, , href]) => href),
              telephone: `+1${SALES_PHONE.replace(/\D/g, "")}`,
              email: EMAIL,
              address: {
                "@type": "PostalAddress",
                streetAddress: ADDRESS_LINE1,
                addressLocality: "Mesa",
                addressRegion: "AZ",
                postalCode: "85201",
                addressCountry: "US",
              },
            }),
          }}
        />
        <header className="site-header">
          <div className="wrap header-inner">
            <a href="/" className="logo" aria-label="Papago Vans home">
              <img src="/home/Group-278.svg" alt="Papago Vans" width="174" height="27" />
            </a>
            <MainNav tiers={tiers} />
            <div className="header-actions">
              <a
                href={CONTACT_FORM_URL}
                className="btn btn-expert btn-sm"
              >
                Talk To An Expert <span className="arw">&#8853;</span>
              </a>
              <a href={tel(SALES_PHONE)} className="btn btn-outline btn-sm hide-sm">
                {SALES_PHONE}
              </a>
              <MobileMenu
                links={[
                  { label: BUILD_LINK.text, href: BUILD_LINK.href, external: BUILD_LINK.external },
                  { label: "Recent Builds", href: "/van-life-build-gallery/" },
                  { label: "Our Process", href: "/our-process/" },
                  { label: "Bespoke Builds", href: "/bespoke/" },
                  { label: "Service Department", href: "/service-department/" },
                  { label: "Financing", href: "/financing/" },
                  { label: "FAQ", href: "/faq/" },
                  { label: "Guides", href: "/blog/" },
                  { label: "About", href: "/about-us/" },
                  { label: "Our Team", href: "/about-us/#our-team" },
                  { label: "Contact", href: "/contact-us/" },
                ]}
                phones={[
                  { label: "Sales & Service", number: SALES_PHONE, href: tel(SALES_PHONE) },
                ]}
                cta={{ label: "Talk To An Expert", href: CONTACT_FORM_URL, external: false }}
              />
            </div>
          </div>
        </header>

        {children}

        <section className="keep-in-touch">
          <div className="wrap kit-inner">
            <p className="kit-eyebrow">Newsletter</p>
            <h2>Let&rsquo;s Keep In Touch</h2>
            <p>Stay informed about our latest sale offers, upgrades and models.</p>
            <div className="kit-form"><HubSpotForm formId={NEWSLETTER_FORM_ID} name="newsletter" card="none" /></div>
          </div>
        </section>

        <footer className="site-footer">
          <img className="footer-art" src="/home/Frame-66.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="wrap footer-inner">
            <div className="footer-cols">
              {footerCols.map((c) => (
                <div className="footer-col" key={c.h}>
                  <h2>{c.h}</h2>
                  <ul>
                    {c.links.map(([label, href]) => (
                      <li key={label}>
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={href.startsWith("http") ? "noopener" : undefined}
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="footer-col footer-contact">
                <h2>Papago Vans</h2>
                <ul>
                  <li><a href={MAP_URL} target="_blank" rel="noopener">{ADDRESS_LINE1}<br />{ADDRESS_LINE2}</a></li>
                  <li><a href={tel(SALES_PHONE)}>Sales &amp; Service {SALES_PHONE}</a></li>
                  <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                </ul>
                <ul className="footer-policies">
                  <li><a href="/terms-conditions/">Terms &amp; Conditions</a></li>
                  <li><a href="/privacy-policy/">Privacy Policy</a></li>
                  <li><a href="/ccpa/">CCPA</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <img src="/home/Group-21-1.svg" alt="Papago Vans" width="120" height="72" loading="lazy" decoding="async" />
              <p className="copyright">&copy; 2026 Papago Vans. All rights reserved</p>
              <div className="social">
                {SOCIALS.map(([name, mark, href]) => (
                  <a href={href} target="_blank" rel="noopener" aria-label={name} key={name}>
                    <span aria-hidden="true">{mark}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
