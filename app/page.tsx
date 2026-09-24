/*
 * Home page.
 *
 * Section order is the owner's, set 2026-09-24:
 *   hero (full viewport, header transparent over it)
 *   two ways to build      Geotrek's bone palette
 *   why papago
 *   photo collage          on the footer navy
 *   testimonials
 *   your van journey       books a call
 *   keep in touch, footer  both live in layout.tsx
 *
 * Removed in the same pass: Explore Our Floor Plans, How Your Dream Van Comes
 * To Life, the Build Your Van Online band (the collage now carries that call to
 * action), Van Platforms We Work With, and Custom Builds Real Stories (the
 * collage replaced it). Git history has all five if any need to come back.
 *
 * Why Papago leads on the one shop photograph either WordPress library holds.
 * Everything else in both libraries is a finished van, so more shop and
 * fabrication photography is worth shooting.
 */

import { listProjectCards } from "@/lib/content";

const BUILD_APP = "https://build.papagovans.com";
const CALENDAR_URL = "https://calendly.com/jeremy-papago/30min";
/* Enough to fill five columns several rows deep at desktop width, and to stay
   full when the wall drops to two columns on a phone. Drawn from 114 distinct
   galleries, so nothing repeats. */
const COLLAGE_COUNT = 45;

const builds = [
  {
    name: "El Capitan",
    price: "Starts at $127,395+",
    img: "image-1-4.webp",
    copy: "This is our top-tier luxury build, featuring premium finishes, custom upgrades, and adventure-ready options. Its spacious, flexible layout is perfect for families or larger groups who want to travel without limits.",
    specs: ["2-6", "920Ah", "Yes", "33G"],
  },
  {
    name: "Build Layout 4",
    price: "Starts at $86,795",
    img: "JMO_1216.webp",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    specs: ["2-6", "460Ah", "Yes", "33G"],
  },
  {
    name: "Build Layout 3",
    price: "Starts at $108,595",
    img: "image-5.webp",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    specs: ["2-6", "920Ah", "Yes", "33G"],
  },
];

/*
 * Two ways to buy. The axis is where the build starts, not how much of it is
 * custom: Tailored starts from a floor plan we have built before, Bespoke
 * starts from nothing. Everything else, the price and the timeline included,
 * falls out of that one difference, which is why the cards lead with it.
 */
const paths = [
  {
    name: "Tailored",
    kicker: "Start from a proven floor plan",
    timing: "Keys in your hand: 14 weeks",
    copy: "Pick one of the five layouts we have built dozens of times, then decide every system in it yourself: power, water, heat, kitchen, storage, finishes. The price moves as you choose, so nothing is a surprise. Download your Build Sheet when you are done.",
    range: "$180,000 - $250,000",
    cta: "Start Your Build",
    href: BUILD_APP,
    external: true,
    featured: true,
  },
  {
    name: "Bespoke",
    kicker: "Start from an empty van",
    timing: "Keys in your hand: 9-14 months",
    copy: "No floor plan, no starting point, just a blank Sprinter and a designer who draws it around how you actually live. Your layout, your cabinetry, your ideas. It costs more and takes the long way round, and for the right owner it is worth every week of it.",
    range: "$200,000 - $300,000",
    cta: "How Bespoke Works",
    href: "/bespoke/",
    external: false,
    featured: false,
  },
];

/* Verbatim from the Customer Stories section of the live site. The two cards
 * that used to sit here were the same placeholder quote printed twice under
 * the same invented name. */
const reviews = [
  { name: "Dr. Julie M.", quote: "I LOVE THESE HUMANS AND MY VAN SO MUCH! Get your van converted by them, I've researched everywhere and they are hands down the BEST!" },
  { name: "Debi L.", quote: "I was very anxious since I was not in the same state, but they went above and beyond my wildest dreams and created an absolutely stunning van for me. I encourage anyone considering a build to reach out to Papago Vans!" },
  { name: "Nai S.", quote: "The team truly listened to my needs and made them a reality. From a custom book shelf to smaller detailed preferences, these guys really honored my dreams from start to finish." },
  { name: "Mike and Melanie", quote: "There is absolutely no way that we could have found a better company to build out our custom dream van to see the USA. Hands down, they're the best in the business. We give our highest recommendation (10+ stars)." },
  { name: "Danielle M.", quote: "To say it has been a pleasure to work with EVERYONE at Papago would be an understatement. They created my custom camper van better than I even imagined. The attention to detail and the little things meant the most!" },
  { name: "Brian L.", quote: "There are a handful of van conversion companies in the Phoenix area but Papago is unique. If I ever plan to do another van conversion, I can't imagine doing it anywhere else." },
  { name: "Wendy F.", quote: "We have been 100% happy right from our beginning inquiry phone call to waving goodbye as we drove our newly finished custom van out the driveway." },
  { name: "Nicole P.", quote: "They listened to my wants and needs and helped me every step of the way to design my campervan exactly how I wanted it." },
  { name: "Michael V.", quote: "Great van conversion place. Veteran owned. Quality service, and they build things to last." },
];

function Stars() {
  return (
    <div className="stars" aria-label="Five out of five stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 19" width="15" height="14" aria-hidden="true">
          <path d="M10 0l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L10 14.3 4.2 17.8l1.6-6.6L.6 6.8l6.8-.5z" />
        </svg>
      ))}
    </div>
  );
}

export default async function Home() {
  const cards = await listProjectCards();
  /* Spread across the alphabet rather than taking the first 15, so the collage
   * is not fifteen vans whose names start with A. */
  const step = Math.max(1, Math.floor(cards.length / COLLAGE_COUNT));
  const collage = Array.from({ length: COLLAGE_COUNT }, (_, i) => cards[(i * step) % cards.length]).filter(Boolean);

  return (
    <>
      {/* Hero. Full viewport, header sits transparent on top of it. */}
      <section className="hero-full">
        <div className="hero-media">
          {/* LCP image: eager, high priority, three widths. Never lazy-load this. */}
          <picture>
            <source
              srcSet="/home/hero-md.avif 900w, /home/hero-lg.avif 1600w, /home/hero-xl.avif 1920w"
              sizes="100vw"
              type="image/avif"
            />
            <source
              srcSet="/home/hero-md.webp 900w, /home/hero-lg.webp 1600w"
              sizes="100vw"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/home/hero-lg.webp"
              alt="A Papago Vans Sprinter with its pop-top raised at a pine forest campsite, a family around the fire at dusk"
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="wrap hero-full-inner">
          {/* The photograph already shows a family at a fire, so the line does not
              describe it. It says the thing the picture cannot: that all of them
              fit, and that the van is what ends the procrastinating. */}
          <h1>Bring Everyone.<br />Go Anywhere.</h1>
          <p>
            Hand built in Mesa, Arizona. Sleeps four, handles the dirt road, and turns
            the trip you keep talking about into one you take.
          </p>
          <div className="hero-full-ctas">
            <a href="#two-ways" className="btn btn-gold">Start Your Build <span className="arw">&#8853;</span></a>
            <a href="/van-life-build-gallery/" className="btn btn-ghost">View Recent Builds <span className="arw">&#8853;</span></a>
          </div>
        </div>
      </section>

      {/* Two ways to build. Geotrek's bone palette, deliberately, because this
          is the section doing the same job on their site. */}
      <section className="paths" id="two-ways">
        <div className="wrap">
          <h2 className="section-title">Two Ways To Build Your Van</h2>
          <p className="section-lede">
            Every Papago is built by hand in Mesa, Arizona. The difference is where you
            start: from a floor plan we have already built dozens of times, or from an
            empty van and a drawing board. Every price includes the Mercedes-Benz Sprinter.
          </p>
          <div className="paths-grid">
            {paths.map((p) => (
              <article className={p.featured ? "path-card is-featured" : "path-card"} key={p.name}>
                {p.featured && <span className="path-flag">Most Popular</span>}
                <p className="path-kicker">{p.kicker}</p>
                <h3 className="path-name">{p.name}</h3>
                <p className="path-timing">{p.timing}</p>
                <p className="path-copy">{p.copy}</p>
                <div className="path-foot">
                  <p className="path-range-label">Pricing range (includes van)</p>
                  <p className="path-range">{p.range}</p>
                  <a
                    href={p.href}
                    target={p.external ? "_blank" : undefined}
                    rel={p.external ? "noopener" : undefined}
                    className={p.featured ? "btn btn-gold btn-block" : "btn btn-outline btn-block"}
                  >
                    {p.cta} <span className="arw">&#8853;</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Papago. The shop photograph is the only one of its kind in either
          WordPress media library: everything else is finished vans. Worth more
          shop and fabrication photography when someone has a camera in there. */}
      <section className="why">
        <div className="wrap why-inner">
          <div className="why-copy">
            <p className="why-eyebrow">Why Papago</p>
            <h2>Built By Hand, In Our Own Shop</h2>
            <p>
              Every van is built in Mesa, Arizona by the same people who drew it. Nothing
              is subcontracted, nothing ships to a third party halfway through, and the
              person who installed your electrical is someone you can ask about it.
            </p>
            <p>
              You get weekly photographs of your own build as it happens. Owners tell us
              that is the part they did not expect and would not give up.
            </p>
            <a href="/bespoke/" className="btn btn-outline">Talk To A Designer <span className="arw">&#8853;</span></a>
          </div>
          <div className="why-shots">
            <figure className="why-team">
              <picture>
                <source srcSet="/shop/team-lg.avif" type="image/avif" />
                <source srcSet="/shop/team-lg.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/shop/team-lg.webp"
                  alt="The Papago Vans crew in the Mesa shop, in front of a row of Sprinters under build"
                  width={1600}
                  height={843}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption>The people who will build your van. Mesa, Arizona.</figcaption>
            </figure>
            <div className="why-pair">
              {collage.slice(0, 2).map((c) => (
                <picture key={c.slug}>
                  <source srcSet={c.thumb_avif} type="image/avif" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.thumb_webp} alt={c.alt} width={c.w} height={c.h} loading="lazy" decoding="async" />
                </picture>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo collage on the footer navy. */}
      <section className="collage">
        <div className="wrap collage-head">
          <h2>This Is What We Do All Day</h2>
          <p>
            {cards.length} finished conversions and counting, every one built by hand in
            Mesa. Price yours in about five minutes.
          </p>
          <a href={BUILD_APP} target="_blank" rel="noopener" className="btn btn-gold">
            Try Our Van Builder <span className="arw">&#8853;</span>
          </a>
        </div>
        <div className="collage-clip">
          <div className="collage-grid">
            <div className="collage-feature">
              <picture>
                <source srcSet="/home/collage-feature.avif" type="image/avif" />
                <source srcSet="/home/collage-feature.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/home/collage-feature.webp"
                  alt="Three children eating breakfast at the dinette of a Papago van, back doors open onto pine forest"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="collage-feature-2">
              <picture>
                <source srcSet="/home/collage-feature-2.avif" type="image/avif" />
                <source srcSet="/home/collage-feature-2.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/home/collage-feature-2.webp"
                  alt="A couple sitting at the swivel-seat table of a Papago van, coffee in hand, side door open"
                  width={1200}
                  height={799}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          {collage.map((c) => (
            <a className="collage-cell" href={c.path} key={c.slug}>
              <picture>
                <source srcSet={c.thumb_avif} type="image/avif" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.thumb_webp}
                  alt={c.alt}
                  width={c.w}
                  height={c.h}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </a>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews">
        <div className="wrap">
          <h2 className="section-title">Real Travelers. Real Adventures.</h2>
          <p className="section-lede">
            Hear from our community of solo travelers, couples and families on how
            Papago Vans helped them create a life on the move.
          </p>
          <div className="review-grid">
            {reviews.map((r) => (
              <blockquote className="review" key={r.name}>
                <Stars />
                <p>{r.quote}</p>
                <cite>{r.name}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="journey">
        <div className="wrap">
          <div className="journey-inner">
            <p className="journey-eyebrow">Next Step</p>
            <h2>Your Van Journey Starts Here</h2>
            <p>
              Fifteen minutes on the phone will tell you more than a week of reading. Pick
              a time that suits you and we will talk through what you actually need.
            </p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
            <p className="journey-alt">
              Or call <a href="tel:+16023460331">+1 602-346-0331</a> and talk to someone now.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
