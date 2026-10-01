import type { MetadataRoute } from "next";
import { listBuildSlugs, listCmsPageSlugs, listPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/* Every published page, post and build, at the trailing-slash paths the site
   serves. Built from the CMS, so a page published in /admin is listed on the
   next request. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, builds] = await Promise.all([listCmsPageSlugs(), listPosts(), listBuildSlugs()]);
  return [
    ...pages.map((s) => ({ url: `${SITE_URL}${s === "home" ? "/" : `/${s}/`}` })),
    { url: `${SITE_URL}/blog/` },
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}/`, lastModified: p.updatedAt })),
    ...builds.map((s) => ({ url: `${SITE_URL}/projects/${s}/` })),
  ];
}
