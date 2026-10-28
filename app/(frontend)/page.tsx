import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/CmsPage";
import { getCmsPage } from "@/lib/content";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, firstPhoto, seo } from "@/lib/seo";

/* The front page is the CMS page whose address is "home". */

export async function generateMetadata(): Promise<Metadata> {
  const p = await getCmsPage("home");
  if (!p) return {};
  return seo("/", p.seoTitle || DEFAULT_TITLE, p.seoDescription || DEFAULT_DESCRIPTION, firstPhoto(p.sections));
}

export default async function Home() {
  const page = await getCmsPage("home");
  if (!page) notFound();
  return <CmsPage page={page} path="/" />;
}
