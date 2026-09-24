import type { Metadata } from "next";
import "./globals.css";

/*
 * Shared shell, ported from the Astro mockup at go.papagovans.com/home.
 *
 * Header, newsletter band and footer live here so a second page cannot drift
 * from the first. This is staging: noindex is set both here and as a response
 * header in next.config.ts, because a copy of the marketing site on our own
 * root domain must never compete with papagovans.com in search.
 *
 * Nav and footer links are still href="#". They become real routes as pages
 * land. Content moves into Payload once there is something worth editing.
 */

const PHONE = "+1 602-346-0331";

const footerCols = [
  // Staging lists "Four Peaks", which is not a plan in the build configurator's
  // catalog. Using the real five so the footer and /signature cannot contradict
  // each other.
  { h: "Campers", links: ["El Capitan", "Zion", "Olympus", "Mammoth", "Rainier"] },
  { h: "Resources", links: ["About Us", "News", "FAQ", "Financing"] },
  { h: "Services", links: ["Interior Installation", "Exterior Upgrades", "Heating and cooling", "Partial Build"] },
  { h: "Policies", links: ["Terms & Conditions", "Privacy Policy", "CCPA"] },
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
        <header className="site-header">
          <div className="wrap header-inner">
            <a href="/" className="logo" aria-label="Papago Vans home">
              <img src="/home/Group-278.svg" alt="Papago Vans" width="174" height="27" />
            </a>
            <nav className="main-nav" aria-label="Main">
              <a href="#">Let&rsquo;s Get Started</a>
              <a href="#">View Recent Builds</a>
            </nav>
            <div className="header-actions">
              <a href="#" className="btn btn-outline btn-sm">Call Now: {PHONE}</a>
              <button className="hamburger" aria-label="Menu"><span /><span /><span /></button>
            </div>
          </div>
        </header>

        {children}

        <section className="keep-in-touch">
          <div className="wrap kit-inner">
            <h2>Let&rsquo;s Keep In Touch</h2>
            <p>Stay informed about our latest sale offers, upgrades and models.</p>
            <a href="#" className="btn btn-gold">Get Started <span className="arw">&#8853;</span></a>
          </div>
        </section>

        <footer className="site-footer">
          <img className="footer-art" src="/home/Frame-66.svg" alt="" aria-hidden="true" />
          <div className="wrap footer-inner">
            <div className="footer-cols">
              {footerCols.map((c) => (
                <div className="footer-col" key={c.h}>
                  <h4>{c.h}</h4>
                  <ul>{c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <img src="/home/Group-21-1.svg" alt="Papago Vans" width="120" height="72" />
              <p className="copyright">&copy; 2026 Papago Vans. All rights reserved</p>
              <div className="social">
                {["f", "t", "in", "@"].map((s) => (
                  <a href="#" aria-label="Social" key={s}><span>{s}</span></a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
