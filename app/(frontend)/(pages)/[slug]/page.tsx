import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { PageSections } from "@/components/PageSections";
import { getCmsPage, listCmsPageSlugs } from "@/lib/content";
import "../../content.css";

/*
 * Every page edited in the CMS (Pages, at /admin), at the site root: /faq/,
 * /zion/, /el-capitan-luxury-van-build/. They keep their original paths
 * because those paths are what rank; the route group's parentheses keep
 * "(pages)" out of the URL. A page built in code (about-us, bespoke) has its
 * own folder, which wins over this route.
 */

export async function generateStaticParams() {
  return (await listCmsPageSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getCmsPage((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle || `${p.heading} | Papago Vans`, description: p.seoDescription ?? undefined };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getCmsPage((await params).slug);
  if (!page) notFound();
  const preview = (await draftMode()).isEnabled;

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
      <section className="page-head">
        <div className="wrap">
          {preview && (
            <p className="preview-bar">
              Preview: this is your latest draft, only visible to you.{" "}
              <a href={`/api/preview/?exit=1&path=/${page.slug}/`}>Exit preview</a>
            </p>
          )}
          {page.eyebrow && <p className="page-eyebrow">{page.eyebrow}</p>}
          <h1>{page.heading}</h1>
          {page.intro && <p className="page-lede">{page.intro}</p>}
        </div>
      </section>

      <section className="page-body">
        <div className="wrap wrap-narrow">
          <PageSections sections={page.sections} />
        </div>
      </section>
    </>
  );
}
