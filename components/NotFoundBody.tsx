/* What a visitor sees on a page that does not exist: say so plainly, then
   give them the four places most people were trying to reach. */
import { BUILD_APP, SALES_PHONE, tel } from "@/lib/site";

export function NotFoundBody() {
  return (
    <section className="page-head not-found">
      <div className="wrap">
        <p className="page-eyebrow">Page not found</p>
        <h1>That Page Took A Wrong Turn</h1>
        <p className="page-lede">
          The address may be from our old site, or mistyped. Here is where most people are headed:
        </p>
        <div className="not-found-links">
          <a href="/van-life-build-gallery/" className="btn btn-outline">Recent Builds <span className="arw">&#8853;</span></a>
          <a href={BUILD_APP} target="_blank" rel="noopener" className="btn btn-gold">Build Your Van <span className="arw">&#8853;</span></a>
          <a href="/blog/" className="btn btn-outline">Guides <span className="arw">&#8853;</span></a>
          <a href="/" className="btn btn-outline">Home <span className="arw">&#8853;</span></a>
        </div>
        <p className="page-cta-alt">
          Or call <a href={tel(SALES_PHONE)}>{SALES_PHONE}</a> and ask for what you were looking for.
        </p>
      </div>
    </section>
  );
}
