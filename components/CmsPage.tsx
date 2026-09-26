/* A whole CMS page: its header, its sections, and the Google markup built from
   them. Shared by the front page and every other page. */
import { draftMode } from "next/headers";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { listProjectCards, listTeam, type CmsPage as Page } from "@/lib/content";
import { PageSections, type PageData } from "./PageSections";
import "@/app/(frontend)/content.css";
import "@/app/(frontend)/bespoke.css";
import "@/app/(frontend)/gallery.css";

const needs = (page: Page, ...types: string[]) => (page.sections ?? []).some((s) => types.includes(s.blockType));

export async function CmsPage({ page, path }: { page: Page; path: string }) {
  const preview = (await draftMode()).isEnabled;
  const text = JSON.stringify(page);
  const [projects, team] = await Promise.all([
    needs(page, "photoWall", "buildGallery") || text.includes("{builds}") ? listProjectCards() : [],
    needs(page, "team") || text.includes("{team}") ? listTeam() : [],
  ]);
  const data: PageData = {
    projects,
    team,
    fill: (s) => (s ?? "").replaceAll("{builds}", String(projects.length)).replaceAll("{team}", String(team.length)),
  };

  /* Marked up so answers can show in search results. Built from the same
     questions the page renders, so none is schema-only. */
  const faqs = (page.sections ?? []).flatMap((s) => (s.blockType === "faq" ? s.items ?? [] : []));

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: convertLexicalToPlaintext({ data: f.answer }) },
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {preview && (
        <p className="preview-bar preview-bar-fixed">
          Preview: this is your latest draft, only visible to you.{" "}
          <a href={`/api/preview/?exit=1&path=${path}`}>Exit preview</a>
        </p>
      )}
      {page.heading && (
        <section className="page-head">
          <div className="wrap">
            {page.eyebrow && <p className="page-eyebrow">{page.eyebrow}</p>}
            <h1>{page.heading}</h1>
            {page.intro && <p className="page-lede">{data.fill(page.intro)}</p>}
          </div>
        </section>
      )}
      <PageSections sections={page.sections} data={data} />
    </>
  );
}
