import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/CmsPage";
import { getCmsPage, listCmsPageSlugs } from "@/lib/content";
import { firstPhoto, seo } from "@/lib/seo";

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
  const slug = (await params).slug;
  const p = await getCmsPage(slug);
  if (!p) return {};
  return {
    ...seo(`/${slug}/`, p.seoTitle || `${p.heading || p.title} | Papago Vans`, p.seoDescription, firstPhoto(p.sections)),
    ...(p.hideFromSearch ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const page = slug === "home" ? null : await getCmsPage(slug);
  if (!page) notFound();
  return <CmsPage page={page} path={`/${slug}/`} />;
}
