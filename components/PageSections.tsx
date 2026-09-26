/* Draws a CMS page's sections with the same markup and classes the hand-built
   pages used, so a page moved into the CMS looks exactly as it did. */
import type { Media, Page } from "@/payload-types";
import { DESTINATIONS, type Destination } from "@/lib/site";
import { RichText } from "./RichText";

type Section = NonNullable<Page["sections"]>[number];
type Dest = { to?: string | null; url?: string | null; text?: string | null } | null | undefined;

function resolve(d: Dest) {
  if (!d?.to) return null;
  if (d.to === "custom") {
    if (!d.url) return null;
    return { href: d.url, text: d.text || d.url, external: /^https?:/.test(d.url) };
  }
  const known = DESTINATIONS[d.to as Destination];
  return known ? { href: known.href, text: d.text || known.text, external: known.external } : null;
}

const ext = (external: boolean) => (external ? { target: "_blank", rel: "noopener" } : {});

function Heading({ text }: { text?: string | null }) {
  return text ? <h2 className="page-h2">{text}</h2> : null;
}

export function PageSections({ sections }: { sections: Page["sections"] }) {
  return <>{(sections ?? []).map((s) => <SectionView s={s} key={s.id} />)}</>;
}

function SectionView({ s }: { s: Section }) {
  switch (s.blockType) {
    case "text":
      return (
        <>
          <Heading text={s.heading} />
          <RichText data={s.content} className="prose page-text" />
        </>
      );

    case "imageText": {
      const img = typeof s.image === "object" ? (s.image as Media) : null;
      return (
        <div className={`scene scene-in-page${s.imageSide === "right" ? " is-flipped" : ""}`}>
          <div className="scene-inner">
            {img?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="scene-shot" src={img.sizes?.large?.url ?? img.url} alt={img.alt} width={img.width ?? undefined} height={img.height ?? undefined} loading="lazy" />
            )}
            <div className="scene-copy">
              {s.eyebrow && <p className="scene-eyebrow">{s.eyebrow}</p>}
              <h2>{s.heading}</h2>
              {s.subheading && <p className="scene-sub">{s.subheading}</p>}
              <RichText data={s.content} />
            </div>
          </div>
        </div>
      );
    }

    case "cards":
      return (
        <>
          <Heading text={s.heading} />
          <div className="cards">
            {s.items?.map((c) => {
              const hl = resolve(c.highlight);
              return (
                <article className="card" key={c.id}>
                  <h2>{c.title}</h2>
                  <p>{c.text}</p>
                  {hl && (
                    <p className="card-strong">
                      <a href={hl.href} {...ext(hl.external)}>{hl.text}</a>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      );

    case "steps":
      return (
        <>
          <Heading text={s.heading} />
          <ol className="steps">
            {s.items?.map((st, i) => (
              <li className="step" key={st.id}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <h2>{st.title}</h2>
                  <p>{st.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      );

    case "faq":
      return (
        <>
          <Heading text={s.heading} />
          {/* <details> rather than a JS accordion: keyboard accessible, prints
              open, and Google reads the answer whether or not it is expanded. */}
          {s.items?.map((f) => (
            <details className="faq" key={f.id}>
              <summary>{f.question}</summary>
              <RichText data={f.answer} className="faq-answer" />
            </details>
          ))}
        </>
      );

    case "checklist":
      return (
        <>
          <Heading text={s.heading} />
          <ul className="ticks">
            {s.items?.map((it) => (
              <li key={it.id}>
                <RichText data={it.text} inline />
              </li>
            ))}
          </ul>
        </>
      );

    case "note":
      return <RichText data={s.content} className="page-note" />;

    case "cta": {
      const b = resolve(s.button);
      return (
        <div className="page-cta">
          <h2>{s.heading}</h2>
          {s.text && <p>{s.text}</p>}
          {b && (
            <a href={b.href} {...ext(b.external)} className="btn btn-gold">
              {b.text} <span className="arw">&#8853;</span>
            </a>
          )}
          {s.smallPrint && (
            <p className="page-cta-alt">
              <RichText data={s.smallPrint} inline />
            </p>
          )}
        </div>
      );
    }
  }
}
