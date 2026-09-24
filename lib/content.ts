/*
 * The one place that knows where content physically lives.
 *
 * Templates call getProject() and listProjectSlugs() and never touch storage.
 * Today those read the JSON the WordPress extractor wrote into content/.
 * When Payload lands, only the two function bodies below change: the templates,
 * the types and the rendered markup all stay exactly as they are.
 *
 * That is the whole reason this module exists. Retrofitting it after five
 * templates already read from disk is the expensive version.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

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
