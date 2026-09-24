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
