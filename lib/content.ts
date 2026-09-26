/*
 * The one place that knows where content physically lives. Everything the
 * site shows comes from the CMS (Payload, edited at /admin): pages, blog
 * posts, builds and the team. Templates call these functions and never touch
 * Payload directly.
 */
import "server-only";
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Build, Media, Post, Team } from "@/payload-types";

export type { Build };

/* A build as the gallery and the photo wall need it: its name, its address
   and its main photo, without the other twenty photos. */
export type ProjectCard = { slug: string; path: string; title: string; summary: string; photo: Media };


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

/* Published only, unless an editor is previewing. */
export async function getBuild(slug: string): Promise<Build | null> {
  const draft = (await draftMode()).isEnabled;
  const { docs } = await (await cms()).find({
    collection: "builds",
    where: draft ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: "published" } },
    draft,
    limit: 1,
    depth: 1,
  });
  return docs[0] ?? null;
}

export async function listBuildSlugs(): Promise<string[]> {
  const { docs } = await (await cms()).find({
    collection: "builds",
    where: { _status: { equals: "published" } },
    pagination: false,
    depth: 0,
    select: { slug: true },
  });
  return docs.map((d) => d.slug).filter((s): s is string => Boolean(s));
}

/* Newest first. Two queries rather than one deep one: populating every photo
   of every build would pull ~2,000 image records to use 115 of them. A build
   with no photos is left out, since it has nothing to show. */
export async function listProjectCards(): Promise<ProjectCard[]> {
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "builds",
    where: { _status: { equals: "published" } },
    sort: "-finished",
    pagination: false,
    depth: 0,
    select: { slug: true, title: true, summary: true, photos: true },
  });
  const firstIds = docs.map((d) => (Array.isArray(d.photos) ? d.photos[0] : undefined)).filter((id): id is number => typeof id === "number");
  const { docs: photos } = await payload.find({
    collection: "media",
    where: { id: { in: firstIds } },
    pagination: false,
    depth: 0,
  });
  const byId = new Map(photos.map((m) => [m.id, m]));
  return docs.flatMap((d) => {
    const photo = Array.isArray(d.photos) ? byId.get(d.photos[0] as number) : undefined;
    return photo && d.slug ? [{ slug: d.slug, path: `/projects/${d.slug}/`, title: d.title, summary: d.summary, photo }] : [];
  });
}
