import type { Metadata } from "next";
import { CALENDAR_URL, BUILD_APP } from "@/lib/site";

/*
 * FAQ.
 *
 * Ported from the WordPress page, but its numbers were wrong for this site.
 * The old page quotes $53,595 to $127,395 excluding the van and a 6 to 9 week
 * build. Owner's call, 2026-09-25: $180,000 including the van is the correct
 * figure and is used everywhere, so the tier prices on the five floor plan
 * pages were rewritten to match and their "the van is NOT included"
 * disclaimers replaced. Treated as current until the shop says otherwise;
 * papagovans.com still publishes the old set.
 *
 * No build timeline, owner's call 2026-09-25: quoting one caused confusion,
 * so the timeline question is gone rather than rewritten.
 *
 * <details> rather than a JS accordion: it opens on click, it is keyboard
 * accessible, it prints open, and Google reads the answer whether or not the
 * panel is expanded.
 */

export const metadata: Metadata = {
  title: "Campervan Conversion FAQ | Papago Vans",
  description:
    "What a Papago build costs, what is included, and how the electrical, water and heating systems actually work.",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How much does a campervan conversion cost?",
    a: (
      <>
        <p>
          <strong>Every floor plan starts at $180,000, and that includes the
          Mercedes-Benz Sprinter.</strong> Not the conversion alone: the van as well,
          finished and ready to drive.
        </p>
        <p>From there three things move the number, and you control all of them:</p>
        <ul className="ticks">
          <li>
            <strong>Chassis length.</strong> The 144 is the $180,000 starting point. A
            170 adds $12,000 and a 170 Extended adds $20,000.
          </li>
          <li>
            <strong>Trim package.</strong> Essential is included. Adventure adds
            $12,500 and Summit adds $28,000, and each one pre-fills every system in the
            van rather than leaving you to spec it piece by piece.
          </li>
          <li>
            <strong>Options.</strong> Solar, battery capacity, an indoor shower, air
            conditioning, a winch. Every one of them is priced before you pick it.
          </li>
        </ul>
        <p>
          That puts most Tailored builds between $180,000 and $250,000. A Bespoke build,
          drawn from nothing rather than from a floor plan, runs $200,000 to $300,000.
        </p>
        <p>
          You do not have to ask us what yours costs. Price it option by option in the{" "}
          <a href={BUILD_APP} target="_blank" rel="noopener">van builder</a> and watch
          the total move as you choose. The number it gives you is the number we quote.
        </p>
      </>
    ),
  },
  {
    q: "Do I need to provide the van, or can you source one?",
    a: (
      <p>
        We source it. Our pricing includes the van, and we buy through dealerships we
        already work with. If you own a Sprinter already, bring it and we will price
        the build on its own.
      </p>
    ),
  },
  {
    q: "What does custom actually mean?",
    a: (
      <p>
        That we will build the layout you want rather than the one that is easiest for
        us. The limits are the shape of the van and a short list of materials we will
        not work with. Everything else is a conversation.
      </p>
    ),
  },
  {
    q: "Can I stay off grid, and for how long?",
    a: (
      <p>
        Yes, and that is most of what the electrical spec buys you. Lithium batteries,
        400W or 600W of solar and a diesel heater mean days out without a hookup rather
        than hours. The exact number depends on the weather and whether you are running
        air conditioning.
      </p>
    ),
  },
  {
    q: "How does the electrical system work?",
    a: (
      <p>
        Solar charges a lithium bank, the van runs at 12V off that bank, and an inverter
        makes 110V for ordinary household outlets. It also charges while you drive. An
        RV has to be plugged in; this does not.
      </p>
    ),
  },
  {
    q: "Do you offer financing?",
    a: (
      <p>
        Yes. We can finance the build and the van together, or the build on its own.
        See <a href="/financing/">Financing</a>.
      </p>
    ),
  },
  {
    q: "Can I choose the finishes?",
    a: (
      <p>
        You pick flooring, wall panels, cabinet faces and countertop from our swatch
        sets. We keep those materials in stock, so choosing from them does not hold up
        your build while something ships.
      </p>
    ),
  },
  {
    q: "What insulation do you use?",
    a: (
      <p>
        Havelock wool in the premium insulation package. It handles moisture better than
        foam, which matters in a van that gets cooked in Phoenix and slept in at 20
        degrees.
      </p>
    ),
  },
  {
    q: "Can I have a bathroom and a shower inside?",
    a: (
      <p>
        Yes. Every build can carry an exterior shower, and an enclosed indoor shower and
        toilet fit in most of the floor plans. The{" "}
        <a href={BUILD_APP} target="_blank" rel="noopener">van builder</a> shows which
        ones on the layout you pick.
      </p>
    ),
  },
  {
    q: "How many people can it sleep?",
    a: (
      <p>
        Two to six depending on the floor plan, the chassis length and whether you add a
        pop-top.
      </p>
    ),
  },
  {
    q: "Do you work on a van you did not build?",
    a: (
      <p>
        Yes. Our <a href="/service-department/">Service Department</a> takes repairs,
        upgrades and unfinished DIY builds on vans, campers and skoolies.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        /* Marked up so the answers can show in search results. Every question
           and answer below is on the page; none is schema-only. */
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.q },
            })),
          }),
        }}
      />
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">Questions</p>
          <h1>Frequently Asked Questions</h1>
          <p className="page-lede">
            The things people ask on the first call. If yours is not here, ask it on a
            call and we will answer it properly.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          {faqs.map((f) => (
            <details className="faq" key={f.q}>
              <summary>{f.q}</summary>
              <div className="faq-answer">{f.a}</div>
            </details>
          ))}

          <div className="page-cta">
            <h2>Still deciding?</h2>
            <p>Fifteen minutes on the phone beats a week of reading.</p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
