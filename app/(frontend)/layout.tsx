import type { Metadata } from "next";
import "./globals.css";
import NewsletterForm from "@/components/NewsletterForm";
import {
  SALES_PHONE, SERVICE_PHONE, EMAIL, ADDRESS_LINE1, ADDRESS_LINE2,
  MAP_URL, CALENDAR_URL, BUILD_APP, SOCIALS, tel,
} from "@/lib/site";

/*
 * Shared shell, ported from the Astro mockup at go.papagovans.com/home.
 *
 * Header, newsletter band and footer live here so a second page cannot drift
 * from the first. This is staging: noindex is set both here and as a response
 * header in next.config.ts, because a copy of the marketing site on our own
 * root domain must never compete with papagovans.com in search.
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
      ["Mammoth", "/mammoth/"],
      ["Rainier", "/rainier/"],
    ],
  },
  {
    h: "Explore",
    links: [
      ["Build Your Van", BUILD_APP],
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
      ["Ram Promaster", "/ram-promaster/"],
      ["Ford Transit", "/ford-transit/"],
    ],
  },
];

export const metadata: Metadata = {
  title: "Arizona Campervan Conversions | Custom Vans by Papago",
  description:
    "Rugged, high-performance Mercedes-Benz Sprinter conversions built by hand in Mesa, Arizona.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Prompt:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Who and where the business is, on every page. It used to sit on
            Contact alone; now that Contact is a CMS page, the layout owns it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutomotiveBusiness",
              name: "Papago Vans",
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
            <nav className="main-nav" aria-label="Main">
              <a href={BUILD_APP} target="_blank" rel="noopener">Build Your Van</a>
              <a href="/van-life-build-gallery/">Recent Builds</a>
              <a href="/our-process/">Our Process</a>
              <a href="/about-us/">About</a>
              <a href="/contact-us/">Contact</a>
            </nav>
            <div className="header-actions">
              <a
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener"
                className="btn btn-expert btn-sm"
              >
                Talk To An Expert <span className="arw">&#8853;</span>
              </a>
              <a href={tel(SALES_PHONE)} className="btn btn-outline btn-sm hide-sm">
                {SALES_PHONE}
              </a>
              <button className="hamburger" aria-label="Menu"><span /><span /><span /></button>
            </div>
          </div>
        </header>

        {children}

        <section className="keep-in-touch">
          <div className="wrap kit-inner">
            <p className="kit-eyebrow">Newsletter</p>
            <h2>Let&rsquo;s Keep In Touch</h2>
            <p>Stay informed about our latest sale offers, upgrades and models.</p>
            <NewsletterForm />
          </div>
        </section>

        <footer className="site-footer">
          <img className="footer-art" src="/home/Frame-66.svg" alt="" aria-hidden="true" />
          <div className="wrap footer-inner">
            <div className="footer-cols">
              {footerCols.map((c) => (
                <div className="footer-col" key={c.h}>
                  <h4>{c.h}</h4>
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
                <h4>Papago Vans</h4>
                <ul>
                  <li><a href={MAP_URL} target="_blank" rel="noopener">{ADDRESS_LINE1}<br />{ADDRESS_LINE2}</a></li>
                  <li><a href={tel(SALES_PHONE)}>Sales {SALES_PHONE}</a></li>
                  <li><a href={tel(SERVICE_PHONE)}>Service {SERVICE_PHONE}</a></li>
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
              <img src="/home/Group-21-1.svg" alt="Papago Vans" width="120" height="72" />
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
