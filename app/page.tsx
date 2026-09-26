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

import ExploreTheVan from "@/components/ExploreTheVan";
import { listProjectCards } from "@/lib/content";
import { SALES_PHONE, tel } from "@/lib/site";

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
/* Picture the experience. Two scenes, one per buyer, in the order the owner
   ranked them: the trailhead buyer first, the open-calendar buyer second.
   Alternating sides, so the page does not read as two of the same block.

   Vocabulary is deliberate and comes from the avatar work. Scene one may say
   trailhead, garage, gear and days without a hookup, and may not say luxury,
   vanlife or glamping. Scene two may say your own bed, real bathroom, heat and
   air and on your schedule, and may not say off-grid, boondocking, rugged or
   anything that reads as old. Rewrite the copy, not the rules. */
const scenes = [
  {
    id: "trailhead",
    /* The two eyebrows are different on purpose, and they carry the real
       difference between the buyers: one goes out for a weekend, the other
       for a month. Two identical eyebrows 400px apart read as a mistake. */
    eyebrow: "A Weekend In Yours",
    title: "Wake Up At The Trailhead",
    sub: "Built around the gear you already own.",
    body: [
      "Coffee on the burner while it is still grey outside, parked where you want to be instead of a hotel forty minutes down the valley.",
      "Bikes, skis and wet gear live in the garage under the bed, locked and drying, not strapped to a rack in the weather. The bed stayed made from the last trip.",
      "Lithium power, real heat and enough water for a hot shower after the ride mean days without a hookup. The snow and the trail set the plan, not the nearest campground with a plug.",
    ],
    shot: "/home/scene-trailhead",
    w: 1200,
    h: 799,
    alt: "A couple at a trailhead beside their Sprinter, rear doors open on a made bed, packs and boots on the ground",
  },
  {
    id: "open-calendar",
    flip: true,
    eyebrow: "A Month In Yours",
    title: "Leave Tuesday. Come Back When You Feel Like It.",
    sub: "Your own bed and your own bathroom, parked wherever you stopped.",
    body: [
      "It is about the length of a crew-cab pickup and drives like one, so a long day on the interstate is just a long day. Pull in where you stopped. The bed is already made and never folds away.",
      "A real bathroom and a hot shower. Heat and air that run without plugging into anything, so a cold morning in Utah and an August afternoon in Texas are both fine. Dinner cooked on your own counter instead of found off an exit ramp.",
      "Drawers that stay shut on the highway hold a week of clothes, the chairs and the dog's bed. Chairs out at a park you did not reserve a year ago, or your daughter's driveway with your own guest room attached.",
    ],
    shot: "/home/scene-open-calendar",
    w: 1200,
    h: 800,
    alt: "A woman cooking at the galley counter of a Sprinter, induction burner going, slider door open on the trees",
  },
];

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

      {/* Explore the van. Deliberately not the builder: this is for the visitor
          who has just landed and wants to see inside one before they care about
          configuring anything. The viewer is a standalone copy, so nothing here
          reaches build.papagovans.com. */}
      <section className="explore" id="explore-the-van">
        <div className="wrap">
          <h2 className="section-title">Explore The Van</h2>
          <p className="section-lede">
            Almost nobody gets to Mesa before they decide. Turn this one around, look
            under the bed, and check the parts you would check if you were standing
            in it.
          </p>
          <div className="explore-viewer">
            <ExploreTheVan />
          </div>
        </div>
      </section>

      {/* Picture the experience: one scene per buyer, both photographed. */}
      {scenes.map((s) => (
        <section className={s.flip ? "scene is-flipped" : "scene"} id={s.id} key={s.id}>
          <div className="wrap scene-inner">
              <picture className="scene-shot">
                <source srcSet={`${s.shot}.avif`} type="image/avif" />
                <source srcSet={`${s.shot}.webp`} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${s.shot}.webp`}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            <div className="scene-copy">
              <p className="scene-eyebrow">{s.eyebrow}</p>
              <h2>{s.title}</h2>
              <p className="scene-sub">{s.sub}</p>
              {s.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Why Papago moved to /about-us/ on the owner's call. It is the
          company's argument for itself, not a step in choosing a van, and the
          home page already has two of those above it. */}

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
            <div className="collage-feature-3">
              <picture>
                <source srcSet="/home/collage-feature-3.avif" type="image/avif" />
                <source srcSet="/home/collage-feature-3.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/home/collage-feature-3.webp"
                  alt="A family sitting around the dinette table of a Papago van, seen from the floor"
                  width={1200}
                  height={900}
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
        </div>
        {/* One marquee row instead of a three-column wall. The list is rendered
            twice into a single track, and the animation shifts the track by
            exactly half its width, so the second copy is sitting where the
            first was when it restarts and the loop has no seam.

            The duplicate is aria-hidden: a screen reader reads nine reviews,
            not eighteen. The row is outside .wrap so the cards run to both
            edges and the mask fades them rather than cutting them off. */}
        <div className="review-row">
          <div className="review-track">
            {[0, 1].map((copy) =>
              reviews.map((r) => (
                <blockquote
                  className="review"
                  key={`${copy}-${r.name}`}
                  aria-hidden={copy === 1 || undefined}
                >
                  <Stars />
                  <p>{r.quote}</p>
                  <cite>{r.name}</cite>
                </blockquote>
              )),
            )}
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
              Or call <a href={tel(SALES_PHONE)}>{SALES_PHONE}</a> and talk to someone now.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
