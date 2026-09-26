import type { Metadata } from "next";
import {
  SALES_PHONE, SERVICE_PHONE, EMAIL, ADDRESS_LINE1, ADDRESS_LINE2,
  MAP_URL, CALENDAR_URL, BUILD_APP, tel,
} from "@/lib/site";

/*
 * Contact.
 *
 * No contact form. The WordPress page had one behind Gravity Forms, and the
 * decision on this rebuild was that every form goes to HubSpot and nothing
 * else, so a hand-rolled form here would be a second thing to maintain and
 * then throw away. Until the HubSpot form exists, a booked call is a better
 * lead than a form fill anyway: it is already on Jeremy's calendar.
 */

export const metadata: Metadata = {
  title: "Contact Papago Vans | Mesa, Arizona",
  description:
    "Call, email or book a time with Jeremy. Papago Vans, 751 N Country Club Dr, Mesa, AZ 85201.",
};

export default function ContactPage() {
  return (
    <>
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
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">Contact</p>
          <h1>Talk To Someone Who Builds These</h1>
          <p className="page-lede">
            Not a call centre and not a chatbot. The fastest way in is to take a slot on
            Jeremy's calendar, because then the conversation is already scheduled.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <div className="page-cta page-cta-top">
            <h2>Book fifteen minutes</h2>
            <p>Pick a time that suits you. No preparation needed.</p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
          </div>

          <div className="cards">
            <article className="card">
              <h2>Sales</h2>
              <p>New builds, pricing, build slots and design.</p>
              <p className="card-strong"><a href={tel(SALES_PHONE)}>{SALES_PHONE}</a></p>
            </article>
            <article className="card">
              <h2>Service</h2>
              <p>Repairs, upgrades and unfinished builds, on any van.</p>
              <p className="card-strong"><a href={tel(SERVICE_PHONE)}>{SERVICE_PHONE}</a></p>
            </article>
            <article className="card">
              <h2>Email</h2>
              <p>Anything that is easier written down, and job applications.</p>
              <p className="card-strong"><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            </article>
            <article className="card">
              <h2>The shop</h2>
              <p>Come and see a van being built. Call ahead so someone is free.</p>
              <p className="card-strong">
                <a href={MAP_URL} target="_blank" rel="noopener">
                  {ADDRESS_LINE1}<br />{ADDRESS_LINE2}
                </a>
              </p>
            </article>
          </div>

          <div className="page-note">
            <p>
              <strong>Know what you want already?</strong> Price it yourself in the{" "}
              <a href={BUILD_APP} target="_blank" rel="noopener">van builder</a> and send
              us the link. Then the first call starts from your build instead of a blank
              page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
