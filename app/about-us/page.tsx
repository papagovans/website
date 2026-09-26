import type { Metadata } from "next";
import { listProjectCards } from "@/lib/content";
import { CALENDAR_URL, ADDRESS_LINE1, ADDRESS_LINE2, MAP_URL } from "@/lib/site";

/*
 * About Us.
 *
 * The "Why Papago" block moved here off the home page, which is where the
 * owner wanted it and where it belongs: it is the company's argument for
 * itself, not a step in choosing a van. The shop photograph came with it,
 * because it is the only image in either WordPress library that shows the
 * claim the copy makes.
 */

export const metadata: Metadata = {
  title: "About Papago Vans | Custom Sprinter Conversions In Mesa, AZ",
  description:
    "Who builds your van, where, and how. Every Papago is built by hand in Mesa, Arizona by the same people who drew it.",
};

const values = [
  { t: "Nothing is subcontracted", d: "Your van does not ship to a third party halfway through. The person who installed your electrical is someone you can ask about it, by name, a year later." },
  { t: "You see it being built", d: "Weekly photographs of your own van as it happens. Owners tell us it is the part they did not expect and would not give up." },
  { t: "The price is the price", d: "Every option is priced before you talk to anyone. You can build the whole thing yourself online and watch the total move." },
  { t: "A dated build slot", d: "Your deposit buys a place in the schedule on a real date, not a place in a queue that keeps moving." },
];

export default async function AboutPage() {
  const shots = (await listProjectCards()).slice(0, 2);

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">About Papago</p>
          <h1>Built By Hand, In Our Own Shop</h1>
          <p className="page-lede">
            Every van is built in Mesa, Arizona by the same people who drew it. That one
            decision is behind most of what makes a Papago different from a van that was
            assembled in three places by people who never met each other.
          </p>
        </div>
      </section>

      <section className="about-shop">
        <div className="wrap why-inner">
          <div className="why-copy">
            <p className="why-eyebrow">Why Papago</p>
            <h2>One Shop, One Crew</h2>
            <p>
              A custom van is thousands of small decisions. Most of them get made with a
              tool in hand, not on a drawing, and they only get made well if the person
              holding the tool knows what you wanted.
            </p>
            <p>
              That is why we do not farm out the cabinetry or the electrical. It is
              slower to staff and it is the reason a Papago fits together.
            </p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-outline">
              Talk To A Designer <span className="arw">&#8853;</span>
            </a>
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
              {shots.map((c) => (
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

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <h2 className="page-h2">What we hold ourselves to</h2>
          <div className="cards">
            {values.map((v) => (
              <article className="card" key={v.t}>
                <h2>{v.t}</h2>
                <p>{v.d}</p>
              </article>
            ))}
          </div>

          <h2 className="page-h2">What we build</h2>
          <p className="page-p">
            Mercedes-Benz Sprinters, in three chassis lengths, on five floor plans we
            have built dozens of times each, or from a blank sheet if none of them fit
            what you are carrying. Every build is RVIA certified, which is what makes it
            insurable and financeable as an RV rather than a modified cargo van.
          </p>
          <p className="page-p">
            We are veteran owned, and we have built enough of these that the
            <a href="/van-life-build-gallery/"> gallery</a> is the fastest way to
            understand what we do.
          </p>

          <h2 className="page-h2">Where we are</h2>
          <p className="page-p">
            <a href={MAP_URL} target="_blank" rel="noopener">
              {ADDRESS_LINE1}, {ADDRESS_LINE2}
            </a>
            . Visitors are welcome. Call ahead and we will make sure someone is free to
            walk you through whatever is on the floor that day.
          </p>

          <div className="page-cta">
            <h2>Come and see one</h2>
            <p>In person if you are near Mesa, on a call if you are not.</p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
