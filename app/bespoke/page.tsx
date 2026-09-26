import type { Metadata } from "next";
import "./bespoke.css";
import { SALES_PHONE, tel } from "@/lib/site";

/*
 * The Bespoke half of the two-way split on the homepage. Tailored hands off to
 * the configurator, which can answer "what does it cost" interactively. Bespoke
 * cannot, because nothing is chosen yet, so this page does that job instead:
 * what it means, what drives the number, and what the number is.
 */

export const metadata: Metadata = {
  title: "Bespoke Van Builds | Papago Vans",
  description:
    "A blank Mercedes-Benz Sprinter and a designer. Fully custom camper van conversions built from scratch in Mesa, Arizona. $200,000 to $300,000, van included.",
};

const WHAT = [
  {
    h: "There is no floor plan",
    p: "A Tailored build starts from one of five layouts we have built dozens of times. Bespoke starts from an empty van and a conversation about how you actually travel, who is coming, and what you refuse to compromise on.",
  },
  {
    h: "The cabinetry is drawn for you",
    p: "Not picked from a catalogue and not adapted from a plan that already existed. Every run is measured, drawn and built in our Mesa shop around your gear and your height.",
  },
  {
    h: "You work with a designer, not a form",
    p: "Drawings, revisions, and real conversations. You will see the layout before a single panel is cut, and you will be asked to change your mind more than once.",
  },
];

const DRIVERS = [
  ["Chassis", "144, 170 or 170 EXT, and whether you want AWD"],
  ["Power system", "A weekender and a full-time off-grid build are not the same battery bank"],
  ["Water and heat", "Indoor shower, hot water and diesel heat each add to the cost"],
  ["Cabinetry", "Solid hardwood, custom galley work and unusual geometry all move the number"],
  ["Lift and tyres", "Suspension, wheels and off-road protection are their own line"],
];

export default function BespokePage() {
  return (
    <div className="bsp wrap">
      <p className="bsp-eyebrow">Bespoke</p>
      <h1>Start From An Empty Van</h1>
      <p className="bsp-lede">
        No floor plan, no starting point. A blank Mercedes-Benz Sprinter and a designer
        who draws the van around the way you actually live. It is the more expensive
        road, and for the right owner it is the only one.
      </p>

      <div className="bsp-grid">
        {WHAT.map((w) => (
          <section className="bsp-card" key={w.h}>
            <h3>{w.h}</h3>
            <p>{w.p}</p>
          </section>
        ))}
      </div>

      <section className="bsp-price">
        <h2>What a Bespoke build costs</h2>
        <p className="bsp-figure">$200,000 &ndash; $300,000</p>
        <p className="bsp-note">
          Van included. That is the Mercedes-Benz Sprinter, the conversion, and the design
          work, not a conversion price with the chassis quoted separately.
        </p>
        <ul className="bsp-drivers">
          {DRIVERS.map(([k, v]) => (
            <li key={k}>
              <b>{k}</b>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="bsp-cta">
        <a className="btn btn-gold" href={tel(SALES_PHONE)}>
          Call {SALES_PHONE} <span className="arw">&#8853;</span>
        </a>
        <a className="btn btn-outline" href="/van-life-build-gallery/">
          See builds we have finished <span className="arw">&#8853;</span>
        </a>
        <span className="muted">Not sure which road you are on? Call and ask. We will say.</span>
      </div>
    </div>
  );
}
