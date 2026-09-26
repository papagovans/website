import type { CollectionConfig } from "payload";

import { signedIn } from "./access";
import { fillSlug, revalidator } from "./revalidate";

const postPath = (slug: string) => `/blog/${slug}/`;

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
  hooks: revalidator(postPath, "/blog/"),
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
