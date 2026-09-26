import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/CmsPage";
import { getCmsPage, listCmsPageSlugs } from "@/lib/content";

/*
 * Every page edited in the CMS (Pages, at /admin) except the front page, at
 * the site root: /faq/, /zion/, /about-us/. They keep their original paths
 * because those paths are what rank; the route group's parentheses keep
 * "(pages)" out of the URL. The page called "home" is served at / by
 * app/(frontend)/page.tsx and not here.
 */

export async function generateStaticParams() {
  return (await listCmsPageSlugs()).filter((s) => s !== "home").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getCmsPage((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle || `${p.heading || p.title} | Papago Vans`, description: p.seoDescription ?? undefined };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const page = slug === "home" ? null : await getCmsPage(slug);
  if (!page) notFound();
  return <CmsPage page={page} path={`/${slug}/`} />;
}
