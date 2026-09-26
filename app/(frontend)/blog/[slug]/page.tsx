import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { getPost, listPosts } from "@/lib/content";
import type { Media } from "@/payload-types";

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  /* Imported posts keep Yoast's title verbatim, because that is the string
   * already earning the click in the results page. */
  return { title: p.seoTitle || `${p.title} | Papago Vans`, description: p.summary };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const hero = typeof post.featuredImage === "object" ? (post.featuredImage as Media | null) : null;
  const preview = (await draftMode()).isEnabled;

  return (
    <article className="article wrap">
      {preview && (
        <p className="preview-bar">
          Preview: this is your latest draft, only visible to you.{" "}
          <a href={`/api/preview/?exit=1&path=/blog/${post.slug}/`}>Exit preview</a>
        </p>
      )}
      <p className="article-eyebrow">Guides</p>
      <h1>{post.title}</h1>
      <p className="article-meta">
        {new Date(post.publishedDate).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
        })}
      </p>
      {hero?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="article-hero" src={hero.sizes?.large?.url ?? hero.url} alt={hero.alt} width={hero.width ?? undefined} height={hero.height ?? undefined} />
      )}
      <RichText data={post.body} className="prose article-body" />
    </article>
  );
}
