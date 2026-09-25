import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, listPages } from "@/lib/content";
import "../../content.css";

export async function generateStaticParams() {
  return (await listPages("posts")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPage((await params).slug);
  if (!p) return {};
  /* Yoast's title verbatim, because that is the string already earning the
   * click in the results page. Rewriting it is a rewrite of the listing. */
  return { title: p.seoTitle ?? p.title, description: p.description };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPage((await params).slug);
  if (!post || post.type !== "posts") notFound();

  return (
    <article className="article wrap">
      <p className="article-eyebrow">Guides</p>
      <h1>{post.title}</h1>
      {post.date && (
        <p className="article-meta">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      )}
      {/* The extractor is the only writer of this field and strips every tag
          and attribute outside a known-safe list. */}
      <div className="prose article-body" dangerouslySetInnerHTML={{ __html: post.body }} />
    </article>
  );
}
