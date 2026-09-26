/*
 * The one place that knows where content physically lives.
 *
 * Templates call getProject() and listProjectSlugs() and never touch storage.
 * Today those read the JSON the WordPress extractor wrote into content/.
 * Pages and blog posts already come from Payload (bottom of this file). For
 * build projects, when they move, only the function bodies below change: the templates,
 * the types and the rendered markup all stay exactly as they are.
 *
 * That is the whole reason this module exists. Retrofitting it after five
 * templates already read from disk is the expensive version.
 */
import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Post, Team } from "@/payload-types";

export type Shot = {
  /* lg only exists on the hero; see scripts/pull-projects.mjs */
  lg_avif?: string;
  lg_webp?: string;
  md_avif: string;
  md_webp: string;
  alt: string;
  portrait: boolean;
  /* Intrinsic size, backfilled by scripts/add-dimensions.mjs. Lets a masonry
   * wall reserve space before the image arrives instead of reflowing. */
  w?: number;
  h?: number;
};

export type Project = {
  slug: string;
  path: string;
  title: string;
  date: string | null;
  excerpt: string;
  body: string[];
  gallery: Shot[];
};

/* process.cwd() rather than import.meta.url: the bundler resolves a URL
 * literal as a module reference and fails the build. */
const DIR = join(process.cwd(), "content", "projects");

export async function getProject(slug: string): Promise<Project | null> {
  try {
    return JSON.parse(await readFile(join(DIR, `${slug}.json`), "utf8"));
  } catch {
    return null;
  }
}

export async function listProjectSlugs(): Promise<string[]> {
  const files = await readdir(DIR).catch(() => [] as string[]);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
}

export type ProjectCard = Pick<Project, "slug" | "path" | "title" | "excerpt"> & {
  thumb_avif: string;
  thumb_webp: string;
  alt: string;
  w?: number;
  h?: number;
};

/* Index listing. Reads every project doc once at build time and keeps only the
 * hero, so the gallery page never loads 2,138 images worth of JSON. */
export async function listProjectCards(): Promise<ProjectCard[]> {
  const slugs = await listProjectSlugs();
  const cards = await Promise.all(slugs.map((s) => getProject(s)));
  return cards
    .filter((p): p is Project => !!p && p.gallery.length > 0)
    .map((p) => ({
      slug: p.slug,
      path: p.path,
      title: p.title,
      excerpt: p.excerpt,
      thumb_avif: p.gallery[0].md_avif,
      thumb_webp: p.gallery[0].md_webp,
      alt: p.gallery[0].alt,
      w: p.gallery[0].w,
      h: p.gallery[0].h,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/* ---------------------------------------------------------------------------
 * Pages and blog posts live in the CMS (Payload, edited at /admin). Build
 * projects above still read the JSON the WordPress extractor wrote.
 * ------------------------------------------------------------------------- */

export type { Post };

const cms = () => getPayload({ config });

/* Published only, unless a signed-in editor is previewing (see
   app/(frontend)/api/preview). */
export async function getPost(slug: string): Promise<Post | null> {
  const draft = (await draftMode()).isEnabled;
  const { docs } = await (await cms()).find({
    collection: "posts",
    where: draft ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: "published" } },
    draft,
    limit: 1,
    depth: 2,
  });
  return docs[0] ?? null;
}

export async function listPosts(): Promise<Post[]> {
  const { docs } = await (await cms()).find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedDate",
    pagination: false,
    depth: 1,
  });
  return docs;
}

export type { Page as CmsPage } from "@/payload-types";

/* Same rules as posts: published only, unless an editor is previewing. */
export async function getCmsPage(slug: string) {
  const draft = (await draftMode()).isEnabled;
  const { docs } = await (await cms()).find({
    collection: "pages",
    where: draft ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: "published" } },
    draft,
    limit: 1,
    depth: 2,
  });
  return docs[0] ?? null;
}

export async function listCmsPageSlugs(): Promise<string[]> {
  const { docs } = await (await cms()).find({
    collection: "pages",
    where: { _status: { equals: "published" } },
    pagination: false,
    depth: 0,
    select: { slug: true },
  });
  return docs.map((d) => d.slug).filter((s): s is string => Boolean(s));
}

/* Everyone on the Team list, in the order staff dragged them into. */
export async function listTeam(): Promise<Team[]> {
  const { docs } = await (await cms()).find({ collection: "team", sort: "_order", pagination: false, depth: 1 });
  return docs;
}
