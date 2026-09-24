/*
 * Home page, ported from the Astro mockup at go.papagovans.com/home.
 *
 * Type, palette and layout were copied from the agency's staging DOM rather
 * than eyeballed:
 *
 *   Prompt          typeface, same as the build configurator
 *   #F4D969         gold, primary action
 *   #414042         body copy
 *   #7B8591         muted copy
 *   #6C93B7         blue band behind "The Papago"
 *   #303C47         footer navy, and the navy the configurator already uses
 *
 * Four deliberate differences from the agency's staging site:
 *   1. The hero is a still rather than a video loop.
 *   2. Staging's five-stat bar under the hero is gone.
 *   3. "Two Ways To Build Your Van" takes its place. Tailored hands off to the
 *      configurator; Bespoke goes to /bespoke/. Signature Pre-Build was dropped
 *      when the company settled on two ways to buy rather than three.
 *   4. A "Build Your Van Online" band points at build.papagovans.com.
 *
 * Copy marked Lorem Ipsum is the agency's placeholder, carried over verbatim
 * so it stays visible as an open item rather than quietly reading as finished.
 */

const BUILD_APP = "https://build.papagovans.com";

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

const steps = [
  { n: "1", img: "image-2.webp", title: "Choose Your Layout", copy: "Browse our five floor plans and pick the layout that fits how you travel." },
  { n: "2", img: "image-4.webp", title: "Customize Your Build", copy: "Select your base chassis and personalize everything from power systems to storage and upgrades." },
  { n: "3", img: "image-2-2.webp", title: "We Build, You Travel", copy: "Our expert team builds your van with precision, updating you at every stage until delivery day." },
];

const gallery = [
  { img: "Papago-Sprinter-Camper-Van-Completed-Build-11-768x512.jpeg", name: "The Northrop Van" },
  { img: "On-the-Brink-Van-3-Large-768x512.jpeg", name: "The Brinkman Van" },
  { img: "Sweeney-Van-Final-Shots-1-Large-768x512.jpeg", name: "The Cherry Van" },
  { img: "Papago-Sprinter-Camper-Van-Complete-170-3500-17-Large-768x512.jpeg", name: "The Turner Van" },
];

const reviews = [
  { id: "popowich", name: "Yale Popowich", meta: "Full-time van lifers, 2+ years on the road" },
  { id: "second", name: "Yale Popowich", meta: "Full-time van lifers, 2+ years on the road" },
];

export default function Home() {
  return (
    <>
      {/* Hero. The agency runs a video loop here; a still stands in for now. */}
      <section className="hero">
        <div className="hero-media">
          <img src="/home/On-the-Brink-Van-9-Large.jpeg" alt="A Papago Vans Sprinter conversion parked on desert flats below the Four Peaks" />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <h1>Camper Vans<br />Built To Explore</h1>
            <p>
              From weekend escapes to full-range adventures, Papago Vans delivers rugged,
              high-performance conversions ready for any terrain.
            </p>
          </div>
          <div className="hero-ctas">
            <a href="#two-ways" className="btn btn-gold">Get Started <span className="arw">&#8853;</span></a>
          </div>
        </div>
      </section>

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

      <section className="buildapp">
        <div className="wrap buildapp-inner">
          <div className="buildapp-copy">
            <p className="eyebrow">New</p>
            <h2>Build Your Van Online</h2>
            <p>
              Pick a floor plan, choose a trim package, and customize every system with a
              running price. Download your Build Sheet when you&rsquo;re done. Every price
              includes the Mercedes-Benz Sprinter.
            </p>
            <a href={BUILD_APP} target="_blank" rel="noopener" className="btn btn-gold">
              Start Building <span className="arw">&#8853;</span>
            </a>
          </div>
          <div className="buildapp-art">
            <img src="/home/Northrop-Sprinter-144-Final-Pics-30-Large.jpeg" alt="Papago Vans Sprinter conversion in the Arizona desert" />
          </div>
        </div>
      </section>

      <section className="builds">
        <div className="wrap">
          <h2 className="section-title">Explore Our Floor Plans</h2>
          <p className="section-lede">
            Five layouts, each drawn for a different way of travelling. Off-roading,
            remote working, or bringing the dog. Every Tailored build starts from one
            of these.
          </p>
        </div>
        <div className="wrap builds-rail">
          <button className="rail-btn rail-prev" aria-label="Previous">&#8249;</button>
          <div className="builds-grid">
            {builds.map((b) => (
              <article className="build-card" key={b.name}>
                <div className="build-img"><img src={`/home/${b.img}`} alt={b.name} /></div>
                <div className="build-body">
                  <div className="build-head">
                    <h3>{b.name}</h3>
                    <span className="price-pill">{b.price}</span>
                  </div>
                  <p className="build-copy">{b.copy}</p>
                  <div className="build-specs">
                    {b.specs.map((sp, i) => (
                      <div className="spec" key={`${b.name}-${i}`}>
                        <img src="/home/Group-280.svg" alt="" width="18" height="18" /><span>{sp}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#" className="btn btn-outline btn-block">Explore <span className="arw">&#8853;</span></a>
                </div>
              </article>
            ))}
          </div>
          <button className="rail-btn rail-next" aria-label="Next">&#8250;</button>
        </div>
      </section>

      <section className="papago">
        <div className="wrap papago-inner">
          <div className="papago-img">
            <img src="/home/papago-model.jpeg" alt="The Papago van model parked on a desert road" />
          </div>
          <div className="papago-card">
            <h2>The Papago</h2>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
              Ipsum has been the industry&rsquo;s standard dummy text ever since the 1500s,
            </p>
            <div className="papago-specs">
              {["2-6", "800Ah", "33G"].map((sp) => (
                <div className="spec" key={sp}>
                  <img src="/home/Group-280.svg" alt="" width="18" height="18" /><span>{sp}</span>
                </div>
              ))}
            </div>
            <a href="#" className="btn btn-gold">Book A Call With Us <span className="arw">&#8853;</span></a>
          </div>
        </div>
      </section>

      <section className="process">
        <div className="wrap process-inner">
          <div className="process-head">
            <h2>How Your Dream<br />Van Comes To Life</h2>
            <p>
              At Papago Vans, we make the process simple, smooth, and actually enjoyable from
              first call to final keys.
            </p>
          </div>
          <div className="process-steps">
            {steps.map((s) => (
              <div className="step-row" key={s.n}>
                <div className="step-img"><img src={`/home/${s.img}`} alt="" /></div>
                <div className="step-card">
                  <span className="step-num">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="platforms">
        <div className="wrap">
          <h2 className="section-title">Van Platforms We Work With</h2>
          <p className="section-lede">
            We work with the most trusted vans on the market and guide you through choosing
            (or sourcing) the right one for your build.
          </p>
          <div className="platform-logos">
            <span className="plat plat-mb" aria-label="Mercedes-Benz">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="29" fill="none" stroke="#414042" strokeWidth="3" />
                <path d="M32 32 32 5 M32 32 8.5 46 M32 32 55.5 46" stroke="#414042" strokeWidth="3" fill="none" />
              </svg>
              <em>Mercedes-Benz</em>
            </span>
            <span className="plat plat-ford" aria-label="Ford">
              <svg viewBox="0 0 160 64" aria-hidden="true">
                <ellipse cx="80" cy="32" rx="78" ry="30" fill="#1B4C9B" />
                <ellipse cx="80" cy="32" rx="73" ry="26" fill="none" stroke="#fff" strokeWidth="2" />
                <text x="80" y="42" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="26" fill="#fff">Ford</text>
              </svg>
            </span>
            <span className="plat plat-ram" aria-label="RAM">
              <svg viewBox="0 0 64 44" aria-hidden="true">
                <path d="M8 14c6-8 14-10 24-10s18 2 24 10c-6-2-12-2-16 2-3 3-5 7-8 7s-5-4-8-7c-4-4-10-4-16-2z" fill="#414042" />
              </svg>
              <em>RAM</em>
            </span>
          </div>
          <div className="center">
            <a href="#" className="btn btn-gold">Talk To a Van Expert</a>
          </div>
        </div>
      </section>

      <section className="stories">
        <div className="wrap stories-head">
          <div>
            <h2 className="section-title left">Custom Builds. Real Stories.</h2>
            <p className="section-lede left">
              See how Papago Vans owners have transformed their lives on the road with
              one-of-a-kind conversions.
            </p>
          </div>
          <a href="#" className="btn btn-outline btn-sm">View All <span className="arw">&#8853;</span></a>
        </div>
        <div className="stories-rail">
          {gallery.map((g) => (
            <figure className="story" key={g.name}>
              <img src={`/home/${g.img}`} alt={g.name} />
              <figcaption>{g.name}</figcaption>
            </figure>
          ))}
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
    </>
  );
}
