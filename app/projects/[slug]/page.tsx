import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../project.css";
import ThemeSwitch from "@/components/ThemeSwitch";

type Shot = {
  lg_avif: string; lg_webp: string;
  md_avif: string; md_webp: string;
  alt: string; portrait: boolean;
};
type Project = {
  slug: string; path: string; title: string;
  date: string | null; excerpt: string; body: string[]; gallery: Shot[];
};

/* process.cwd() rather than import.meta.url: the bundler resolves a URL
 * literal as a module reference and fails the build. */
const DIR = join(process.cwd(), "content", "projects");

async function load(slug: string): Promise<Project | null> {
  try {
    return JSON.parse(await readFile(join(DIR, `${slug}.json`), "utf8"));
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const files = await readdir(DIR).catch(() => [] as string[]);
  return files.filter((f) => f.endsWith(".json")).map((f) => ({ slug: f.replace(/\.json$/, "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  return { title: `${p.title} | Papago Vans`, description: p.excerpt };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();

  const [hero, ...rest] = p.gallery;

  return (
    <article className="proj wrap">
      {hero && (
        <div className="proj-hero">
          <picture>
            <source srcSet={hero.lg_avif} type="image/avif" />
            <source srcSet={hero.lg_webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.lg_webp} alt={hero.alt} fetchPriority="high" />
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
                <source srcSet={`${s.md_avif} 800w, ${s.lg_avif} 1600w`} sizes="(max-width: 700px) 100vw, 33vw" type="image/avif" />
                <source srcSet={`${s.md_webp} 800w, ${s.lg_webp} 1600w`} sizes="(max-width: 700px) 100vw, 33vw" type="image/webp" />
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

      <ThemeSwitch />
    </article>
  );
}
