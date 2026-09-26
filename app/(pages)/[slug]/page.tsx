import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, listPages } from "@/lib/content";
import "../../content.css";

/*
 * Standalone pages that live at the site root: /faq/, /about-us/, /zion/,
 * /el-capitan-luxury-van-build/. They keep their original paths because those
 * paths are what rank; the route group's parentheses keep "(pages)" out of the
 * URL entirely.
 */

/* Slugs that now have a hand-built route of their own. The ported WordPress
   body for each still sits in content/pages, unused: it is the record of what
   the old page said, and the source the rewrite was checked against. Leaving
   them in here would make two routes claim one path. */
const REBUILT = new Set([
  "about-us", "our-process", "faq", "service-department",
  "financing", "work-at-papago-vans", "contact-us",
]);

export async function generateStaticParams() {
  return (await listPages("pages"))
    .filter((p) => !REBUILT.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPage((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle ?? p.title, description: p.description };
}

export default async function StandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (REBUILT.has(slug)) notFound();
  const page = await getPage(slug);
  if (!page || page.type !== "pages") notFound();

  return (
    <article className="article wrap">
      <h1>{page.title}</h1>
      <div className="prose article-body" dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}
