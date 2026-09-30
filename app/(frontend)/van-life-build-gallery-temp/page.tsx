import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/CmsPage";
import { getCmsPage } from "@/lib/content";

/*
 * Stopgap, 2026-09-29. The gallery on the live papagovans.com is broken, so the
 * live URL points here until this site launches. Same CMS page as
 * /van-life-build-gallery/, so an edit in /admin shows on both. The shared
 * layout's nav, header buttons, newsletter band and footer are hidden here;
 * only the logo stays, and it does not link, so a visitor from the live site
 * is not walked into staging. Delete this route on launch day.
 */

const SOURCE = "van-life-build-gallery";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getCmsPage(SOURCE);
  if (!p) return {};
  return { title: p.seoTitle || `${p.heading || p.title} | Papago Vans`, description: p.seoDescription ?? undefined };
}

export default async function Page() {
  const page = await getCmsPage(SOURCE);
  if (!page) notFound();
  return (
    <>
      <style>{`.main-nav,.header-actions,.keep-in-touch,.site-footer{display:none!important}.site-header .logo{pointer-events:none}`}</style>
      <CmsPage page={page} path={`/${SOURCE}/`} />
    </>
  );
}
