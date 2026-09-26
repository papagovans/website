import type { CollectionConfig } from "payload";

import { signedIn } from "./access";
import { blocks } from "./blocks";
import { fillSlug, revalidator } from "./revalidate";

const pagePath = (slug: string) => `/${slug}/`;

/* Addresses the site already uses for pages built in code. A CMS page at one
   of these would never be seen, because the coded page wins. */
const TAKEN = ["admin", "api", "blog", "projects", "about-us", "bespoke", "van-life-build-gallery"];

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    description:
      "The site's pages, built from sections you can add, reorder and remove. Your work saves automatically as a draft; nothing is public until you click Publish. The home page, About, Bespoke and the Build Gallery are still edited in code.",
    listSearchableFields: ["title", "heading"],
    preview: (doc) =>
      doc?.slug ? `/api/preview/?path=${encodeURIComponent(pagePath(String(doc.slug)))}` : null,
  },
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  trash: true,
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  defaultSort: "title",
  hooks: revalidator(pagePath),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Page",
          fields: [
            {
              name: "title",
              label: "Page name",
              type: "text",
              required: true,
              admin: { description: 'What staff call it, e.g. "FAQ". Used in this list and to fill in the web address.' },
            },
            {
              name: "eyebrow",
              label: "Small label above the heading",
              type: "text",
              admin: { description: 'One or two words in capitals, e.g. "Service Department".' },
            },
            {
              name: "heading",
              label: "Main heading",
              type: "text",
              required: true,
              admin: { description: "The big headline at the top of the page. Say what the visitor gets, not what the page is." },
            },
            {
              name: "intro",
              label: "Introduction",
              type: "textarea",
              admin: { description: "Optional. Two or three sentences under the heading." },
            },
            {
              name: "sections",
              label: "Page sections",
              type: "blocks",
              blocks,
              admin: {
                initCollapsed: true,
                description: "Add sections with the button below. Drag the handle on the left of a section to move it.",
              },
            },
          ],
        },
        {
          label: "Search Engines",
          description: "What Google shows for this page.",
          fields: [
            {
              name: "seoTitle",
              label: "Title in Google",
              type: "text",
              admin: { description: 'The blue link in search results. Blank uses the main heading followed by "| Papago Vans". Keep it under 60 characters.' },
            },
            {
              name: "seoDescription",
              label: "Description in Google",
              type: "textarea",
              maxLength: 320,
              admin: { description: "The grey text under the link. One or two sentences; Google cuts off around 155 characters." },
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      label: "Web address",
      type: "text",
      unique: true,
      index: true,
      hooks: { beforeValidate: [fillSlug] },
      validate: (value: string | null | undefined) =>
        value && TAKEN.includes(value) ? `/${value}/ is already a page built in code. Choose another address.` : true,
      admin: {
        position: "sidebar",
        description: "papagovans.com/this-part/. Filled in from the page name when you first save. Changing it after publishing breaks links people already have.",
      },
    },
  ],
};
