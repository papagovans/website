import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../project.css";
import { getProject, listProjectSlugs } from "@/lib/content";

export async function generateStaticParams() {
  return (await listProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return { title: `${p.title} | Papago Vans`, description: p.excerpt };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  if (!p) notFound();

  const [hero, ...rest] = p.gallery;

  return (
    <article className="proj wrap">
      {hero && (
        <div className="proj-hero">
          <picture>
            <source srcSet={hero.lg_avif ?? hero.md_avif} type="image/avif" />
            <source srcSet={hero.lg_webp ?? hero.md_webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.lg_webp ?? hero.md_webp} alt={hero.alt} fetchPriority="high" />
          </picture>
        </div>
      )}

      <header className="proj-head">
        <div className="proj-eyebrow">Build Gallery</div>
        <h1 className="proj-title">{p.title}</h1>
      </header>

      <div className="proj-body">
        {p.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="proj-grid">
          {rest.map((s, i) => (
            <figure key={s.md_avif} className={s.portrait ? "tall" : undefined}>
              <picture>
                <source srcSet={s.md_avif} type="image/avif" />
                <source srcSet={s.md_webp} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.md_webp} alt={s.alt} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
              </picture>
            </figure>
          ))}
        </div>
      )}

      <section className="proj-cta">
        <div>
          <h2>Want something like this?</h2>
          <p>Every Papago van starts as a conversation about how you actually travel.</p>
        </div>
        <a className="btn-accent" href="https://build.papagovans.com">
          Start Your Build
        </a>
      </section>
    </article>
  );
}
