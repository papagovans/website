/* Draws a CMS page's sections with the same markup and classes the hand-built
   pages used, so a page moved into the CMS looks exactly as it did.

   Content sections sit in the reading column; consecutive ones share one
   <section class="page-body">. Full-width sections draw their own. */
import ExploreTheVan from "@/components/ExploreTheVan";
import { WIDE } from "@/collections/blocks";
import { DEPARTMENTS } from "@/collections/Team";
import type { ProjectCard } from "@/lib/content";
import { DESTINATIONS, type Destination } from "@/lib/site";
import type { Media, Page, Team } from "@/payload-types";
import { Photo } from "./Photo";
import { RichText } from "./RichText";

type Section = NonNullable<Page["sections"]>[number];
type Dest = { to?: string | null; url?: string | null; text?: string | null } | null | undefined;
export type PageData = { projects: ProjectCard[]; team: Team[]; fill: (s?: string | null) => string };

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
const media = (m: unknown) => (m && typeof m === "object" ? (m as Media) : null);

function Button({ d, className }: { d: Dest; className: string }) {
  const b = resolve(d);
  if (!b) return null;
  return (
    <a href={b.href} {...ext(b.external)} className={className}>
      {b.text} <span className="arw">&#8853;</span>
    </a>
  );
}

function Heading({ text }: { text?: string | null }) {
  return text ? <h2 className="page-h2">{text}</h2> : null;
}

/* A Call to Action set to "Full-width band" is wide too. */
const isWide = (s: Section) => WIDE.has(s.blockType) || (s.blockType === "cta" && s.style === "band");

export function PageSections({ sections, data }: { sections: Page["sections"]; data: PageData }) {
  const runs: Section[][] = [];
  for (const s of sections ?? []) {
    const last = runs.at(-1);
    if (!isWide(s) && last && !isWide(last[0])) last.push(s);
    else runs.push([s]);
  }
  return (
    <>
      {runs.map((run) =>
        isWide(run[0]) ? (
          <Wide s={run[0]} data={data} key={run[0].id} />
        ) : (
          <section className="page-body" key={run[0].id}>
            <div className="wrap wrap-narrow">
              {run.map((s) => <Narrow s={s} data={data} key={s.id} />)}
            </div>
          </section>
        ),
      )}
    </>
  );
}

/* Small departments share a line: a row each would be headings over
   near-empty grids. Each column is sized by headcount, so a portrait is the
   same size whichever row it lands in. */
const TEAM_ROWS = [["Administration", "Finance"], ["Sales", "Marketing"], ["Inventory", "CNC Specialists"]];

function TeamGroup({ dept, people, eager }: { dept: string; people: Team[]; eager: boolean }) {
  return (
    <section className="team-group" aria-labelledby={`team-${dept}`}>
      <h3 className="team-dept" id={`team-${dept}`}>{dept}</h3>
      <ul className="team-grid">
        {people.map((m) => {
          const p = media(m.photo);
          return (
            <li className="team-card" key={m.id}>
              <Photo m={p} sizes="200px" max="thumb" eager={eager} alt={`${m.name}, ${m.role} at Papago Vans`} />
              <p className="team-name">{m.name}</p>
              <p className="team-role">{m.role}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TeamGrid({ team }: { team: Team[] }) {
  const byDept = new Map<string, Team[]>();
  for (const m of team) byDept.set(m.department, [...(byDept.get(m.department) ?? []), m]);
  const paired = TEAM_ROWS.flat();
  const rows: string[][] = [];
  /* Department order is fixed, so dragging one person never moves a whole
     department. Any department not in the list goes at the end. */
  const order = [...DEPARTMENTS, ...[...byDept.keys()].filter((d) => !(DEPARTMENTS as readonly string[]).includes(d))];
  for (const dept of order.filter((d) => byDept.has(d))) {
    if (!paired.includes(dept)) rows.push([dept]);
    const pair = TEAM_ROWS.find((r) => r[0] === dept);
    if (pair) rows.push(pair.filter((d) => byDept.has(d)));
  }
  return (
    <>
      {rows.map((row, i) =>
        row.length === 1 ? (
          <TeamGroup dept={row[0]} people={byDept.get(row[0])!} eager={i === 0} key={row[0]} />
        ) : (
          <div
            className="team-row"
            key={row.join()}
            style={{ gridTemplateColumns: row.map((d) => `${byDept.get(d)!.length}fr`).join(" ") }}
          >
            {row.map((d) => <TeamGroup dept={d} people={byDept.get(d)!} eager={false} key={d} />)}
          </div>
        ),
      )}
    </>
  );
}

function Narrow({ s, data }: { s: Section; data: PageData }) {
  switch (s.blockType) {
    case "text":
      return (
        <>
          <Heading text={s.heading} />
          <RichText data={s.content} className="prose page-text" />
        </>
      );

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

    case "priceBox":
      return (
        <section className="bsp-price">
          <h2>{s.heading}</h2>
          <p className="bsp-figure">{s.price}</p>
          {s.note && <p className="bsp-note">{s.note}</p>}
          {!!s.items?.length && (
            <ul className="bsp-drivers">
              {s.items.map((it) => (
                <li key={it.id}>
                  <b>{it.title}</b>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      );

    case "team":
      return (
        <>
          <Heading text={s.heading} />
          {s.intro && <p className="page-p">{data.fill(s.intro)}</p>}
          <TeamGrid team={data.team} />
        </>
      );

    case "timeline":
      return (
        <>
          <Heading text={s.heading} />
          <ol className="timeline">
            {s.items?.map((m) => (
              <li className="milestone" key={m.id}>
                <p className="milestone-when">{m.when}</p>
                <div className="milestone-body">
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      );

    case "cta":
      return (
        <div className="page-cta">
          {s.heading && <h2>{s.heading}</h2>}
          {s.text && <p>{s.text}</p>}
          <div className="page-cta-buttons">
            <Button d={s.button} className="btn btn-gold" />
            <Button d={s.secondButton} className="btn btn-outline" />
          </div>
          {s.smallPrint && (
            <p className="page-cta-alt">
              <RichText data={s.smallPrint} inline />
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}

const COLLAGE_COUNT = 45;

function Wide({ s, data }: { s: Section; data: PageData }) {
  switch (s.blockType) {
    case "hero":
      return (
        <section className="hero-full">
          <div className="hero-media">
            {/* LCP image: eager and high priority. Never lazy-load this. */}
            <Photo m={media(s.image)} sizes="100vw" eager />
          </div>
          <div className="wrap hero-full-inner">
            <h1>
              {s.heading.split("\n").map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h1>
            {s.text && <p>{s.text}</p>}
            <div className="hero-full-ctas">
              <Button d={s.button} className="btn btn-gold" />
              <Button d={s.secondButton} className="btn btn-ghost" />
            </div>
          </div>
        </section>
      );

    case "pathCards":
      return (
        <section className="paths" id={s.anchor || undefined}>
          <div className="wrap">
            <h2 className="section-title">{s.heading}</h2>
            {s.intro && <p className="section-lede">{s.intro}</p>}
            <div className="paths-grid">
              {s.items?.map((p) => (
                <article className={p.featured ? "path-card is-featured" : "path-card"} key={p.id}>
                  {p.featured && p.flag && <span className="path-flag">{p.flag}</span>}
                  {p.kicker && <p className="path-kicker">{p.kicker}</p>}
                  <h3 className="path-name">{p.title}</h3>
                  <p className="path-copy">{p.text}</p>
                  <div className="path-foot">
                    {p.priceLabel && <p className="path-range-label">{p.priceLabel}</p>}
                    <p className="path-range">{p.price}</p>
                    <Button d={p.button} className={p.featured ? "btn btn-gold btn-block" : "btn btn-outline btn-block"} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );

    case "vanTour":
      return (
        <section className="explore" id="explore-the-van">
          <div className="wrap">
            <h2 className="section-title">{s.heading}</h2>
            {s.intro && <p className="section-lede">{s.intro}</p>}
            <div className="explore-viewer">
              <ExploreTheVan />
            </div>
          </div>
        </section>
      );

    case "imageText":
      return (
        <section className={s.imageSide === "right" ? "scene is-flipped" : "scene"}>
          <div className="wrap scene-inner">
            <figure className="scene-shot">
              <Photo m={media(s.image)} sizes="(max-width: 860px) 100vw, 50vw" />
              {s.caption && <figcaption>{s.caption}</figcaption>}
            </figure>
            <div className="scene-copy">
              {s.eyebrow && <p className="scene-eyebrow">{s.eyebrow}</p>}
              <h2>{s.heading}</h2>
              {s.subheading && <p className="scene-sub">{s.subheading}</p>}
              <RichText data={s.content} />
              <Button d={s.button} className="btn btn-outline scene-btn" />
            </div>
          </div>
        </section>
      );

    case "photoWall": {
      const cards = data.projects;
      /* Spread across the alphabet rather than taking the first 45, so the
         wall is not a run of vans whose names start with A. */
      const step = Math.max(1, Math.floor(cards.length / COLLAGE_COUNT));
      const wall = Array.from({ length: COLLAGE_COUNT }, (_, i) => cards[(i * step) % cards.length]).filter(Boolean);
      const big = (Array.isArray(s.featured) ? s.featured : []).map(media);
      return (
        <section className="collage">
          <div className="wrap collage-head">
            <h2>{s.heading}</h2>
            {s.text && <p>{data.fill(s.text)}</p>}
            <Button d={s.button} className="btn btn-gold" />
          </div>
          <div className="collage-clip">
            <div className="collage-grid">
              {big.map((m, i) => (
                <div className={i === 0 ? "collage-feature" : `collage-feature-${i + 1}`} key={m?.id ?? i}>
                  <Photo m={m} sizes="(max-width: 860px) 100vw, 40vw" />
                </div>
              ))}
              {wall.map((c) => (
                <a className="collage-cell" href={c.path} key={c.slug}>
                  <Photo m={c.photo} sizes="(max-width: 600px) 50vw, 20vw" max="card" />
                </a>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "testimonials":
      return (
        <section className="reviews">
          <div className="wrap">
            <h2 className="section-title">{s.heading}</h2>
            {s.intro && <p className="section-lede">{s.intro}</p>}
          </div>
          {/* One marquee row. The list is rendered twice into one track and the
              animation shifts it by exactly half its width, so the loop has no
              seam. The copy is aria-hidden: a screen reader reads each once. */}
          <div className="review-row">
            <div className="review-track">
              {[0, 1].map((copy) =>
                s.items?.map((r) => (
                  <blockquote className="review" key={`${copy}-${r.id}`} aria-hidden={copy === 1 || undefined}>
                    <Stars />
                    <p>{r.quote}</p>
                    <cite>{r.name}</cite>
                  </blockquote>
                )),
              )}
            </div>
          </div>
        </section>
      );

    case "buildGallery":
      return (
        <section className="gal">
          <div className="wrap">
            <div className="gal-grid">
              {data.projects.map((c, i) => (
                <a className="gal-card" href={c.path} key={c.slug}>
                  <Photo m={c.photo} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 380px" max="card" eager={i < 3} />
                  <h2>{c.title}</h2>
                </a>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="journey">
          <div className="wrap">
            <div className="journey-inner">
              {s.eyebrow && <p className="journey-eyebrow">{s.eyebrow}</p>}
              {s.heading && <h2>{s.heading}</h2>}
              {s.text && <p>{s.text}</p>}
              <Button d={s.button} className="btn btn-gold" />
              <Button d={s.secondButton} className="btn btn-outline" />
              {s.smallPrint && (
                <p className="journey-alt">
                  <RichText data={s.smallPrint} inline />
                </p>
              )}
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

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
