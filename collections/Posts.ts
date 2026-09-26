import type { CollectionAfterChangeHook, CollectionConfig, FieldHook } from "payload";

import { signedIn } from "./access";

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* Filled from the title the first time the post is saved, then left alone:
   a post's address is what Google and everyone's bookmarks point at. */
const fillSlug: FieldHook = ({ value, data }) =>
  value ? slugify(String(value)) : data?.title ? slugify(String(data.title)) : value;

const postPath = (slug?: string | null) => `/blog/${slug}/`;

/* The blog is prerendered. Publishing, unpublishing or renaming a post tells
   Next which pages to rebuild, so the change is live on the next visit. */
const revalidate: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (doc._status !== "published" && previousDoc?._status !== "published") return doc;
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog/");
    revalidatePath(postPath(doc.slug));
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidatePath(postPath(previousDoc.slug));
  } catch {
    // Outside a Next request (the import script), there is no cache to clear.
  }
  return doc;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "publishedDate", "_status", "updatedAt"],
    description:
      "Articles on the Guides page. Your work saves automatically as a draft; nothing is public until you click Publish.",
    listSearchableFields: ["title", "summary"],
    preview: (doc) =>
      doc?.slug ? `/api/preview/?path=${encodeURIComponent(postPath(String(doc.slug)))}` : null,
  },
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  // Deleting moves a post to Trash, where it can be restored.
  trash: true,
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 50,
  },
  defaultSort: "-publishedDate",
  hooks: {
    afterChange: [revalidate],
    afterDelete: [({ doc }) => revalidate({ doc: { ...doc, _status: "published" } } as never)],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Post",
          fields: [
            { name: "title", type: "text", required: true },
            {
              name: "summary",
              type: "textarea",
              required: true,
              maxLength: 320,
              admin: {
                description:
                  "One or two sentences on what the reader will learn. Shown under the title on the Guides page and in Google results. Google cuts off around 155 characters.",
              },
            },
            {
              name: "featuredImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Optional. The main photo for the post." },
            },
            {
              name: "body",
              label: "Article",
              type: "richText",
              required: true,
              admin: {
                description:
                  "Use Heading 2 for main sections and Heading 3 inside them. Add a photo with the image button in the toolbar, or by typing /image.",
              },
            },
          ],
        },
        {
          label: "Search Engines",
          description: "Optional. Leave these blank and sensible defaults are used.",
          fields: [
            {
              name: "seoTitle",
              label: "Title in Google",
              type: "text",
              admin: {
                description:
                  'The blue link in search results. Blank uses the post title followed by "| Papago Vans". Keep it under 60 characters.',
              },
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      label: "Web address",
      type: "text",
      // Not `required`: the form would refuse an empty box before the hook
      // below got the chance to fill it from the title.
      unique: true,
      index: true,
      hooks: { beforeValidate: [fillSlug] },
      admin: {
        position: "sidebar",
        description:
          "papagovans.com/blog/this-part/. Filled in from the title when you first save. Changing it after publishing breaks links people already have.",
      },
    },
    {
      name: "publishedDate",
      label: "Date",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "MMMM d, yyyy" },
        description: "Shown on the post. Guides are listed newest first.",
      },
    },
  ],
};
