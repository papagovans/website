import type { Metadata } from "next";
import { EMAIL, ADDRESS_LINE1, ADDRESS_LINE2 } from "@/lib/site";

/*
 * Careers. Keeps /work-at-papago-vans/ because that is the indexed URL.
 *
 * The WordPress page carried a Gravity Form with a resume upload. That form
 * did not come across and is not rebuilt here: a file upload needs somewhere
 * to put the file, and email is both simpler and where these end up anyway.
 * Swap in a HubSpot form when the rest of the forms move.
 */

export const metadata: Metadata = {
  title: "Careers | Work At Papago Vans, Mesa AZ",
  description:
    "Build custom Mercedes-Benz Sprinter conversions in Mesa, Arizona. Carpentry, electrical, upholstery, fabrication and operations roles.",
};

const areas = [
  { t: "Build and carpentry", d: "Cabinetry, framing, flooring and finish work to furniture standard, in a space the size of a corridor." },
  { t: "Electrical", d: "12V and 110V systems, lithium, solar, inverters and shore power. The system owners ask the most questions about." },
  { t: "Fabrication", d: "Metalwork, racks, bumpers, brackets and the mounts nobody sells off the shelf." },
  { t: "Upholstery and soft goods", d: "Seating, cushions, headliners and the parts of the van people actually touch." },
  { t: "Operations and admin", d: "Scheduling, purchasing, and keeping a shop full of builds running smoothly." },
];

export default function CareersPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">Careers</p>
          <h1>Build Vans In Mesa</h1>
          <p className="page-lede">
            Everything we sell is built in our own shop by the people who drew it.
            Nothing is subcontracted, which means the work here is the actual work, not
            managing somebody else doing it.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <h2 className="page-h2">Where we usually need people</h2>
          <div className="cards">
            {areas.map((a) => (
              <article className="card" key={a.t}>
                <h2>{a.t}</h2>
                <p>{a.d}</p>
              </article>
            ))}
          </div>

          <h2 className="page-h2">How to apply</h2>
          <p className="page-p">
            Send a resume to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with the area you
            are interested in in the subject line. If you have photographs of work you
            have done, send those too. In this trade they say more than a resume does.
          </p>
          <p className="page-p">
            We read everything that comes in, and we keep applications on file even when
            nothing is open, because the shop grows in steps rather than smoothly.
          </p>

          <div className="page-note">
            <p>
              <strong>No open posting right now?</strong> Send it anyway. Most of the
              people here applied before there was a job to apply for.
            </p>
          </div>

          <h2 className="page-h2">Where you would be working</h2>
          <p className="page-p">
            {ADDRESS_LINE1}, {ADDRESS_LINE2}.
          </p>
        </div>
      </section>
    </>
  );
}
