import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Photo } from "@/components/Photo";
import { RichText } from "@/components/RichText";
import { getBuild, listBuildSlugs } from "@/lib/content";
import type { Media } from "@/payload-types";
import { BUILD_APP } from "@/lib/site";

export async function generateStaticParams() {
  return (await listBuildSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await getBuild((await params).slug);
  if (!b) return {};
  return { title: `${b.title} | Papago Vans`, description: b.summary };
}

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = await getBuild((await params).slug);
  if (!b) notFound();
  const photos = (b.photos ?? []).filter((m): m is Media => typeof m === "object" && m !== null);
  const [hero, ...rest] = photos;
  const preview = (await draftMode()).isEnabled;

  return (
    <article className="proj wrap">
      {preview && (
        <p className="preview-bar preview-bar-fixed">
          Preview: this is your latest draft, only visible to you.{" "}
          <a href={`/api/preview/?exit=1&path=/projects/${b.slug}/`}>Exit preview</a>
        </p>
      )}
      {hero && (
        <div className="proj-hero">
          <Photo m={hero} sizes="(max-width: 1240px) 100vw, 1200px" eager />
        </div>
      )}

      <header className="proj-head">
        <div className="proj-eyebrow">Build Gallery</div>
        <h1 className="proj-title">{b.title}</h1>
      </header>

      <RichText data={b.description} className="proj-body" />

      {rest.length > 0 && (
        <div className="proj-grid">
          {rest.map((m, i) => (
            <figure key={m.id} className={(m.height ?? 0) > (m.width ?? 0) ? "tall" : undefined}>
              <Photo m={m} sizes="(max-width: 700px) 100vw, 400px" max="card" eager={i < 3} />
            </figure>
          ))}
        </div>
      )}

      <section className="proj-cta">
        <div>
          <h2>Want something like this?</h2>
          <p>Every Papago van starts as a conversation about how you actually travel.</p>
        </div>
        <a className="btn-accent" href={BUILD_APP}>
          Start Your Build
        </a>
      </section>
    </article>
  );
}
