import type { Metadata } from "next";
import { CALENDAR_URL, SALES_PHONE, tel } from "@/lib/site";

/*
 * Financing.
 *
 * The WordPress page this replaces was empty. Its title promised "Camper Van
 * Financing with Hearth" and its body contained the single word "financing",
 * so there was nothing to port and nothing to preserve.
 *
 * Deliberately no rates, no terms, no monthly payment example and no lender
 * named. Those are numbers only the shop and its lender can state, they move,
 * and a wrong one on a page like this is the kind of thing a buyer quotes back
 * at closing. Everything here is either true of any RV loan or already true of
 * Papago. Fill in the specifics once Jeremy confirms the lender and terms.
 */

export const metadata: Metadata = {
  title: "Camper Van Financing | Papago Vans",
  description:
    "Finance the build and the van together, or the build on its own. How van financing works and what to have ready before you apply.",
};

export default function FinancingPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="page-eyebrow">Financing</p>
          <h1>Finance The Van And The Build Together</h1>
          <p className="page-lede">
            Most buyers do not write one cheque for a van conversion. We can arrange
            financing that covers the Sprinter and the conversion as a single amount,
            or just the conversion if you already own the van.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <div className="cards">
            <article className="card">
              <h2>One loan, not two</h2>
              <p>
                A van and a conversion bought separately can mean a vehicle loan and a
                second personal loan at a worse rate. Financed together, the finished
                van is the asset, which is usually the cheaper way to do it.
              </p>
            </article>
            <article className="card">
              <h2>Build only</h2>
              <p>
                Already have a Sprinter? We can finance just the conversion, so the van
                you own stays yours and out of the paperwork.
              </p>
            </article>
            <article className="card">
              <h2>RVIA certification matters</h2>
              <p>
                Papago builds are RVIA certified. Lenders and insurers treat a certified
                conversion as an RV rather than a modified cargo van, which is what makes
                RV-term lending and proper coverage available at all.
              </p>
            </article>
            <article className="card">
              <h2>Apply before you design</h2>
              <p>
                Knowing your number first turns the design meeting into real decisions
                instead of guesses. It also means your build is not waiting on an
                approval.
              </p>
            </article>
          </div>

          <h2 className="page-h2">What to have ready</h2>
          <ul className="ticks">
            <li>The build you want priced. The <a href="https://build.papagovans.com" target="_blank" rel="noopener">van builder</a> gives you an itemised total in about five minutes.</li>
            <li>Proof of income, the same documents any vehicle loan asks for.</li>
            <li>A rough deposit figure. More down is a smaller monthly payment and usually a better rate.</li>
          </ul>

          <div className="page-note">
            <p>
              <strong>Rates and terms come from the lender, not from us.</strong> We will
              not quote you a monthly payment on a web page and have it change by the
              time you sign. Get your build priced, then we will put you in front of the
              real numbers.
            </p>
          </div>

          <div className="page-cta">
            <h2>Talk through the numbers</h2>
            <p>Fifteen minutes, no application, no credit pull.</p>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn btn-gold">
              Schedule A Call <span className="arw">&#8853;</span>
            </a>
            <p className="page-cta-alt">
              Or call <a href={tel(SALES_PHONE)}>{SALES_PHONE}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
