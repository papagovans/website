/* Draws a CMS page's sections with the same markup and classes the hand-built
   pages used, so a page moved into the CMS looks exactly as it did.

   Content sections sit in the reading column; consecutive ones share one
   <section class="page-body">. Full-width sections draw their own. */
import ExploreTheVan from "@/components/ExploreTheVan";
import { WIDE } from "@/collections/blocks";
import { DEPARTMENTS } from "@/collections/Team";
import type { ProjectCard, TierLink } from "@/lib/content";
import { DESTINATIONS, type Destination } from "@/lib/site";
import type { Media, Page, Team } from "@/payload-types";
import { HubSpotForm, SERVICE_FORM_ID } from "./HubSpotForm";
import { LoopVideo } from "./LoopVideo";
import { PopUp } from "./PopUp";
import { Photo } from "./Photo";
import { RevealSlider } from "./RevealSlider";
import { RichText } from "./RichText";
import { Tabs } from "./Tabs";

type Section = NonNullable<Page["sections"]>[number];
type Dest = { to?: string | null; url?: string | null; text?: string | null } | null | undefined;
export type PageData = { projects: ProjectCard[]; team: Team[]; tiers: TierLink[]; fill: (s?: string | null) => string };

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

/* A build tier links to its floor plan page, or sits still when it has none. */
function Tier({ link, className, children }: { link?: string | null; className: string; children: React.ReactNode }) {
  return link ? <a href={link} className={className}>{children}</a> : <div className={className}>{children}</div>;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const lineList = (t?: string | null) => (t ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
const photos = (v: unknown) => (Array.isArray(v) ? v.map(media).filter((m): m is Media => m !== null) : []);

function PhotoStrip({ heading, list }: { heading: string; list: Media[] }) {
  if (!list.length) return null;
  return (
    <section className="tp-strip">
      <div className="wrap"><h2 className="section-title">{heading}</h2></div>
      <div className="tp-strip-row">
        {list.map((m) => (
          <div className="tp-strip-cell" key={m.id}>
            <Photo m={m} sizes="(max-width: 720px) 80vw, 30vw" max="card" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* A build tier's own page. Sections with nothing in them are left out. */
function TierPage({ s, data }: { s: Extract<Section, { blockType: "tierPage" }>; data: PageData }) {
  const total = s.price + (s.vanAllowance ?? 0);
  const id = s.name.toLowerCase().replace(/\W+/g, "-");
  const features = (s.features ?? []).filter((f) => f.name);
  const builds = (s.builds ?? [])
    .map((b) => data.projects.find((c) => c.slug === (typeof b === "object" ? b.slug : null)))
    .filter((c): c is ProjectCard => Boolean(c));
  const others = data.tiers.filter((t) => t.name !== s.name);
  return (
    <>
      <section className="tp-hero">
        <div className="hero-media">
          <Photo m={media(s.heroPhoto)} sizes="100vw" eager />
        </div>
        <div className="wrap tp-hero-inner">
          <nav className="tp-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/van-conversion-build-tiers/">Build Tiers</a> <span aria-hidden="true">/</span> <span aria-current="page">{s.name}</span>
          </nav>
          <h1>{s.name}</h1>
          {s.tagline && <p className="tp-tagline">{s.tagline}</p>}
          <p className="tp-from">Starts at</p>
          <p className="tp-price">{usd(total)}</p>
          {s.priceNote && <p className="tp-note">{s.priceNote}</p>}
          <div className="hero-full-ctas">
            <a href={DESTINATIONS.calendar.href} target="_blank" rel="noopener" className="btn btn-gold">Talk To An Expert <span className="arw">&#8853;</span></a>
            <a href="/van-conversion-build-tiers/" className="btn btn-ghost">Compare All Tiers</a>
          </div>
        </div>
      </section>

      {!!s.stats?.length && (
        <section className="tp-stats">
          <ul className="wrap">
            {s.stats.map((x) => <li key={x.id}><strong>{x.value}</strong><span>{x.label}</span></li>)}
          </ul>
        </section>
      )}

      {s.intro && (
        <section className={media(s.introPhoto) ? "scene tp-intro" : "scene tp-intro is-text"}>
          <div className="wrap scene-inner">
            {media(s.introPhoto) && (
              <figure className="scene-shot"><Photo m={media(s.introPhoto)} sizes="(max-width: 860px) 100vw, 50vw" /></figure>
            )}
            <div className="scene-copy">
              <p className="scene-eyebrow">The {s.name}</p>
              {s.introHeading && <h2>{s.introHeading}</h2>}
              {s.intro.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="tp-features">
          <div className="wrap">
            <h2 className="section-title">Build Features</h2>
            <p className="section-lede">What comes in every {s.name}, system by system.</p>
            <Tabs
              id={`${id}-features`}
              className="tp-feature-tabs"
              tabs={features.map((f) => ({
                label: f.name,
                panel: (
                  <div className={media(f.photo) ? "tp-feature" : "tp-feature is-text"}>
                    {media(f.photo) && <div className="tp-feature-photo"><Photo m={media(f.photo)} sizes="(max-width: 860px) 100vw, 50vw" max="card" /></div>}
                    <div>
                      <h3>{f.name}</h3>
                      <ul className="ticks">{lineList(f.items).map((l) => <li key={l}>{l}</li>)}</ul>
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
        </section>
      )}

      <PhotoStrip heading="Interior Highlights" list={photos(s.interiorPhotos)} />
      <PhotoStrip heading="Exterior Upgrades" list={photos(s.exteriorPhotos)} />

      {!!s.packages?.length && (
        <section className="tp-packages">
          <div className="wrap">
            <h2 className="section-title">Package Upgrades</h2>
            <p className="section-lede">Bundles you can add to the {s.name}. Ask us for current pricing.</p>
            <div className="tp-packages-grid">
              {s.packages.map((p) => (
                <details className="faq" key={p.id}>
                  <summary>{p.name}</summary>
                  {p.description && <div className="faq-answer"><p>{p.description}</p></div>}
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!s.alaCarte?.length && (
        <section className="tp-alc">
          <div className="wrap">
            <div className="tp-alc-card">
              <h2>A La Carte Upgrades</h2>
              <Tabs
                id={`${id}-alc`}
                className="tp-alc-tabs"
                tabs={s.alaCarte.map((c) => ({
                  label: c.name,
                  panel: <ul className="ticks">{lineList(c.items).map((l) => <li key={l}>{l}</li>)}</ul>,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {builds.length > 0 && (
        <section className="tp-builds">
          <div className="wrap">
            <h2 className="section-title">Featured Builds</h2>
            <div className="tp-builds-grid">
              {builds.map((b) => (
                <a className="tp-build" href={b.path} key={b.slug}>
                  <Photo m={b.photo} sizes="(max-width: 720px) 100vw, 25vw" max="card" />
                  <h3>{b.title}</h3>
                  <p>{s.name} build tier</p>
                </a>
              ))}
            </div>
            <p className="tp-center"><a href="/van-life-build-gallery/" className="btn btn-outline">View All Builds <span className="arw">&#8853;</span></a></p>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="tp-others">
          <div className="wrap">
            <h2 className="section-title">Other Build Tiers</h2>
            <p className="section-lede">Each layout works on the Mercedes-Benz Sprinter, Ford Transit and Ram ProMaster. Which one is right for you?</p>
            <div className="tp-others-grid">
              {others.map((t) => (
                <a className="tp-other" href={t.path} key={t.path}>
                  <Photo m={t.photo} sizes="(max-width: 720px) 100vw, 25vw" max="card" alt="" />
                  <span className="tp-other-copy">
                    <strong>{t.name}</strong>
                    {t.tagline && <span>{t.tagline}</span>}
                    <span className="tp-other-price">From {usd(t.total)}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
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
              {p ? (
                <Photo m={p} sizes="200px" max="thumb" eager={eager} alt={`${m.name}${m.role ? `, ${m.role}` : ""} at Papago Vans`} />
              ) : (
                <div className="team-blank" aria-hidden="true" />
              )}
              <p className="team-name">{m.name}</p>
              {m.role && <p className="team-role">{m.role}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TeamGrid({ team }: { team: Team[] }) {
  const byDept = new Map<string, Team[]>();
  for (const m of team) { const d = m.department ?? "Team"; byDept.set(d, [...(byDept.get(d) ?? []), m]); }
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

    case "contactForm":
      return (
        <section className="contact-block" id={s.anchor || "contact-form"}>
          <Heading text={s.heading} />
          {s.intro && <p className="page-p">{s.intro}</p>}
          {/* ponytail: preset picks the default form; a typed form id overrides it */}
          <HubSpotForm
            formId={s.formId?.trim() || (s.preset === "service" ? SERVICE_FORM_ID : undefined)}
            card={s.lightCard ? "light" : "navy"}
            name={s.preset === "service" ? "contact_service" : "contact_conversion"}
          />
        </section>
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
/* Where mixed-in photos land among the small tiles: scattered through the
   rows seen first on a desktop, never two in the same column in a row. */
const MIX_SLOTS = [1, 3, 7, 10, 14, 19];

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

    case "photoShowcase": {
      const rest = (Array.isArray(s.photos) ? s.photos : []).map(media).filter(Boolean);
      const cutout = s.imageStyle === "cutout";
      const reveal = s.imageStyle === "reveal" && media(s.revealFront);
      const over = !cutout && !reveal && s.headingPlacement === "over";
      const facts = (s.proof ?? []).map((f) => f.text).filter(Boolean);
      const head = (
        <header className="showcase-head">
          {s.eyebrow && <p className="showcase-eyebrow">{s.eyebrow}</p>}
          <h2>{s.heading}</h2>
          {facts.length > 0 && (
            <ul className="showcase-proof">
              {facts.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
        </header>
      );
      return (
        <section className={cutout ? "showcase is-cutout" : over ? "showcase is-over" : "showcase"}>
          {cutout ? (
            <div className="showcase-cut">
              {head}
              <div className="showcase-van">
                <Photo m={media(s.image)} sizes="(max-width: 860px) 92vw, 56vw" />
              </div>
            </div>
          ) : reveal ? (
            <>
              {head}
              <RevealSlider
                label="Gimme trees: drag to bring the forest in behind the van"
                tag="Gimme Trees"
                back={<Photo m={media(s.image)} sizes="(max-width: 720px) 180vw, 100vw" />}
                front={<Photo m={media(s.revealFront)} sizes="(max-width: 720px) 180vw, 100vw" />}
                ground={s.revealGround ? <Photo m={media(s.revealGround)} sizes="(max-width: 720px) 180vw, 100vw" /> : null}
              />
            </>
          ) : (
            <>
              {!over && head}
              <div className="showcase-main">
                {/* A phone crops the wide photo to 4:3, which enlarges it about 1.8x. */}
                <Photo m={media(s.image)} sizes="(max-width: 720px) 180vw, 100vw" />
                {over && <h2>{s.heading}</h2>}
              </div>
            </>
          )}
          {rest.length > 0 && (
            <div className="showcase-row" style={{ ["--n" as string]: rest.length }}>
              {rest.map((m) => (
                <div className="showcase-cell" key={m!.id}>
                  <Photo m={m} sizes="(max-width: 720px) 70vw, 20vw" max="card" />
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "buildTiers": {
      const tiers = [...(s.tiers ?? [])].sort((x, y) => x.price - y.price);
      const van = s.vanAllowance ?? 0;
      const top = Math.max(...tiers.map((t) => t.price + van), 1);
      return (
        <section className="tiers">
          <div className="wrap">
            <h2 className="section-title">{s.heading}</h2>
            {s.intro?.split(/\n\s*\n/).map((p, i) => <p className="section-lede" key={i}>{p}</p>)}
            {s.chassisLine && <p className="tier-chassis">{s.chassisLine}</p>}
            <ol className="tier-ladder">
              {tiers.map((t) => (
                <li key={t.id}>
                  <Tier link={t.link} className="tier-rung">
                    <h3>{t.name}</h3>
                    {/* ponytail: bar length is the price's share of the top tier; CSS floors it so the cheapest still fits its van */}
                    <div className="tier-bar" style={{ "--share": (t.price + van) / top } as React.CSSProperties}>
                      <span className="tier-price">{usd(t.price + van)}+</span>
                      <span className="tier-van">
                        {(t.art === "olympus" || t.art === "el-capitan") && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/build-tiers/tent-${t.art}.svg`} alt="" className="tier-tent" />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/build-tiers/van-${t.art}.svg`} alt={`${t.name} van`} />
                      </span>
                    </div>
                  </Tier>
                </li>
              ))}
            </ol>
            {s.priceNote && <p className="tier-note">{s.priceNote}</p>}
            {s.cardsHeading && <h2 className="section-title tiers-cards-title">{s.cardsHeading}</h2>}
            <div className="tier-cards">
              {tiers.map((t) => (
                <article className="tier-card" key={t.id} id={t.name.toLowerCase().replace(/\s+/g, "-")}>
                  <div className="tier-card-photo">
                    <Photo m={media(t.photo)} sizes="(max-width: 860px) 100vw, 560px" max="card" alt="" />
                  </div>
                  <div className="tier-card-body">
                    {t.tagline && <p className="tier-card-tag">{t.tagline}</p>}
                    <h3>{t.name}</h3>
                    <p className="tier-card-price">From <strong>{usd(t.price + van)}</strong></p>
                    {van > 0 && <p className="tier-card-split">{usd(t.price)} build + {usd(van)} van allowance</p>}
                    {t.summary && <p className="tier-card-copy">{t.summary}</p>}
                    {!!t.specs?.length && (
                      <ul className="tier-specs">
                        {t.specs.map((x) => <li key={x.id}><strong>{x.value}</strong> {x.label}</li>)}
                      </ul>
                    )}
                    {t.link ? (
                      <a href={t.link} className="btn btn-outline">See the {t.name} <span className="arw">&#8853;</span></a>
                    ) : (
                      <a href={DESTINATIONS.calendar.href} target="_blank" rel="noopener" className="btn btn-outline">Ask about the {t.name} <span className="arw">&#8853;</span></a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "tierPage":
      return <TierPage s={s} data={data} />;

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
                  {(media(p.image) || media(p.video)) && (
                    <div className="path-media">
                      {media(p.video)?.url ? (
                        <LoopVideo
                          src={media(p.video)!.url!}
                          poster={media(p.image)?.sizes?.card?.url ?? media(p.image)?.url ?? undefined}
                          label={media(p.video)!.alt}
                        />
                      ) : (
                        <Photo m={media(p.image)} sizes="(max-width: 860px) 100vw, 440px" max="card" />
                      )}
                    </div>
                  )}
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
            {s.button?.to && (
              <p className="explore-cta">
                <Button d={s.button} className="btn btn-gold" />
              </p>
            )}
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
      const mix = (s.mixIn ?? []).map(media).filter((m): m is Media => m !== null);
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
              {wall.map((c, i) => {
                const extra = mix[MIX_SLOTS.indexOf(i)];
                return extra ? (
                  <div className="collage-cell" key={`mix-${extra.id}`}>
                    <Photo m={extra} sizes="(max-width: 600px) 50vw, 20vw" max="card" />
                  </div>
                ) : (
                  <a className="collage-cell" href={c.path} key={c.slug}>
                    <Photo m={c.photo} sizes="(max-width: 600px) 50vw, 20vw" max="card" />
                  </a>
                );
              })}
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

    case "cta": {
      const people = (s.people ?? []).map(media).filter((m): m is Media => m !== null);
      return (
        <section className={people.length ? "journey has-people" : "journey"}>
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
              {people.length > 0 && (
                <PopUp
                  className="journey-people"
                  items={people.map((m) => (
                    <Photo m={m} sizes="(max-width: 760px) 100vw, 680px" key={m.id} />
                  ))}
                />
              )}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

function Stars() {
  return (
    <div className="stars" role="img" aria-label="Five out of five stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 19" width="15" height="14" aria-hidden="true">
          <path d="M10 0l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L10 14.3 4.2 17.8l1.6-6.6L.6 6.8l6.8-.5z" />
        </svg>
      ))}
    </div>
  );
}
