import type { Metadata } from "next";
import { CALENDAR_URL } from "@/lib/site";

/*
 * Our Process. The ten steps are the shop's own, ported from WordPress; the
 * wording is tightened and the "Adventure Awaits" step is gone, because it is
 * not a step, it is a slogan.
 */

export const metadata: Metadata = {
  title: "Our Process | How A Papago Van Gets Built",
  description:
    "Ten steps from first call to keys: design consultation, 3D renderings, deposit, construction, final inspection and walkthrough.",
};

const steps = [
  { t: "Reach out", d: "A call with Jeremy about where you want to go, who is coming, and what you haul. No configuration, no pressure." },
  { t: "Get a real quote", d: "An itemised number for the build you described, not a range. You see what every option costs before you commit to any of them." },
  { t: "We source the van", d: "We buy through dealerships we already work with. If you own a Sprinter, bring it and we price the build alone." },
  { t: "Secure your build", d: "A deposit reserves your build and locks your pricing." },
  { t: "Design meeting", d: "Layout, finishes, and every system in the van, decided together with the people who will actually build it." },
  { t: "3D renderings", d: "You see your van before it exists, from the inside. Changes here cost nothing. Changes after the cabinets are cut cost a lot." },
  { t: "Approve the final design", d: "One sign-off that locks the drawing, so nobody is guessing on the shop floor." },
  { t: "The build begins", d: "Chassis work first where it applies, lift kits and body upgrades, then insulation, electrical, plumbing, cabinetry and finishes." },
  { t: "Detail check", d: "Every system run and every fixture checked before anyone calls it done. This is where rattles and leaks get found, not on your first trip." },
  { t: "Delivery and walkthrough", d: "We hand you the keys and then spend as long as it takes showing you how everything works, because a van you cannot operate is not finished." },
];

export default function OurProcessPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">How It Works</p>
          <h1>From First Call To Keys</h1>
          <p className="page-lede">
            Ten steps, in order, with your deposit in the middle of them. You get
            weekly photographs of your own van the whole way through.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <ol className="steps">
            {steps.map((s, i) => (
              <li className="step" key={s.t}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <h2>{s.t}</h2>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="page-cta">
            <h2>Start at step one</h2>
            <p>Pick a time and tell us where you want to wake up.</p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
