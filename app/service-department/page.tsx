import type { Metadata } from "next";
import { SERVICE_PHONE, tel, CALENDAR_URL } from "@/lib/site";

/*
 * Service Department. Its own phone line, which is the reason this page has a
 * different number on it from every other page on the site.
 */

export const metadata: Metadata = {
  title: "Camper Van Service & Repair In Mesa, AZ | Papago Vans",
  description:
    "Repairs, upgrades and unfinished DIY builds on vans, campers and skoolies. Interior, exterior, electrical, heating and cooling, and partial builds.",
};

const services = [
  { t: "Interior", d: "Cabinetry, flooring, beds, seating, insulation and finish work. Whether you are fixing something that failed or finishing something you started." },
  { t: "Exterior", d: "Roof racks, awnings, bumpers, winches, ladders, lighting, solar mounting and window installs." },
  { t: "Electrical", d: "Lithium systems, solar, inverters, DC-DC charging, shore power and the wiring behind all of it. The most common thing owners of other vans call us about." },
  { t: "Heating and cooling", d: "Diesel heaters, roof fans, 12V air conditioning, and the ducting and controls that make them usable." },
  { t: "Partial builds", d: "You did the shell and ran out of road. We finish it, to the same standard as a van we started ourselves." },
];

export default function ServicePage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">Service Department</p>
          <h1>You Have Got A Van. We Can Work On It.</h1>
          <p className="page-lede">
            You do not have to buy a build from us to get one fixed. Our service side
            takes vans, campers and skoolies, including ones somebody else built and
            ones you started yourself.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <div className="cards">
            {services.map((s) => (
              <article className="card" key={s.t}>
                <h2>{s.t}</h2>
                <p>{s.d}</p>
              </article>
            ))}
          </div>

          <div className="page-cta">
            <h2>Book a service appointment</h2>
            <p>
              The service line is separate from sales and reaches the shop directly.
            </p>
            <a href={tel(SERVICE_PHONE)} className="btn btn-gold">
              Call {SERVICE_PHONE} <span className="arw">&#8853;</span>
            </a>
            <p className="page-cta-alt">
              Or <a href={CALENDAR_URL} target="_blank" rel="noopener">book a time</a> and
              we will call you.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
