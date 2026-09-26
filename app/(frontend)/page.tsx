import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/CmsPage";
import { getCmsPage } from "@/lib/content";

/* The front page is the CMS page whose address is "home". */

export async function generateMetadata(): Promise<Metadata> {
  const p = await getCmsPage("home");
  if (!p) return {};
  return {
    ...(p.seoTitle ? { title: p.seoTitle } : {}),
    ...(p.seoDescription ? { description: p.seoDescription } : {}),
  };
}

export default async function Home() {
  const page = await getCmsPage("home");
  if (!page) notFound();
  return <CmsPage page={page} path="/" />;
}
