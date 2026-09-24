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

const reviews = [
  { id: "popowich", name: "Yale Popowich", meta: "Full-time van lifers, 2+ years on the road" },
  { id: "second", name: "Yale Popowich", meta: "Full-time van lifers, 2+ years on the road" },
];

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
          <img src="/home/On-the-Brink-Van-9-Large.jpeg" alt="A Papago Vans Sprinter conversion parked on desert flats below the Four Peaks" fetchPriority="high" />
        </div>
        <div className="wrap hero-full-inner">
          <h1>Camper Vans<br />Built To Explore</h1>
          <p>
            From weekend escapes to full-range adventures, Papago Vans delivers rugged,
            high-performance conversions ready for any terrain.
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
        <div className="wrap stories-head">
          <div>
            <h2 className="section-title left">Real Travelers. Real Adventures.</h2>
            <p className="section-lede left">
              Hear from our community of solo travelers, couples and families on how
              Papago Vans helped them create a life on the move.
            </p>
          </div>
          <a href="#" className="btn btn-outline btn-sm">Read More Stories <span className="arw">&#8853;</span></a>
        </div>
        <div className="wrap review-grid">
          {reviews.map((r) => (
            <blockquote className="review" key={r.id}>
              <img src="/home/Frame-39.svg" alt="5 out of 5 stars" width="120" height="22" />
              <p>
                If I could give 6 stars, I would. This is a professional outfit all the way.
                From helping me source my van, to helping select the perfect options for my
                needs, they never disappointed. The components they use are all first class.
                The weekly photo updates of my build were also so greatly appreciated, kept me
                in the loop during the entire build.
              </p>
              <footer>
                <img src="/home/image-1-1.webp" alt="" width="48" height="48" />
                <div>
                  <cite>{r.name}</cite>
                  <span>{r.meta}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="journey">
        <div className="wrap journey-inner">
          <h2>Your Van Journey Starts Here</h2>
          <p>
            Fifteen minutes on the phone will tell you more than a week of reading. Pick a
            time that suits you and we will talk through what you actually need.
          </p>
          <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
            Schedule A Call <span className="arw">&#8853;</span>
          </a>
          <p className="journey-alt">
            Or call <a href="tel:+16023460331">+1 602-346-0331</a> and talk to someone now.
          </p>
        </div>
      </section>
    </>
  );
}
