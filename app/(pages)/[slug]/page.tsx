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

export async function generateStaticParams() {
  return (await listPages("pages")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPage((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle ?? p.title, description: p.description };
}

export default async function StandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getPage((await params).slug);
  if (!page || page.type !== "pages") notFound();

  return (
    <article className="article wrap">
      <h1>{page.title}</h1>
      <div className="prose article-body" dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}
