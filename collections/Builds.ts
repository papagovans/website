import type { CollectionConfig } from "payload";

import { signedIn } from "./access";
import { answerText } from "./fields";
import { fillSlug } from "./revalidate";

const buildPath = (slug: string) => `/projects/${slug}/`;

/* A build shows on its own page, in the Build Gallery, on the home page's
   Photo Wall and in every {builds} count, so a change rebuilds the site. */
const rebuildAll = async () => {
  try {
    (await import("next/cache")).revalidatePath("/", "layout");
  } catch {
    // Outside a Next request (an import script) there is no cache to clear.
  }
};

export const Builds: CollectionConfig = {
  slug: "builds",
  labels: { singular: "Build", plural: "Builds" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "finished", "_status", "updatedAt"],
    description:
      "Finished vans. Each one gets its own page and appears in the Build Gallery and on the home page's photo wall, newest first. Your work saves automatically as a draft; nothing is public until you click Publish.",
    listSearchableFields: ["title", "summary"],
    preview: (doc) => (doc?.slug ? `/api/preview/?path=${encodeURIComponent(buildPath(String(doc.slug)))}` : null),
  },
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  trash: true,
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  defaultSort: "-finished",
  hooks: {
    afterChange: [async ({ doc, previousDoc }) => {
      if (doc._status === "published" || previousDoc?._status === "published") await rebuildAll();
      return doc;
    }],
    afterDelete: [rebuildAll],
  },
  fields: [
    {
      name: "title",
      label: "Build name",
      type: "text",
      required: true,
      admin: { description: 'The name the owners gave it, e.g. "Sky Lounge".' },
    },
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description:
          "Drag to reorder. The first photo is the main one: it leads the page and is the picture in the gallery, so make it the whole van. A build with no photos stays out of the gallery.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 320,
      admin: { description: "One or two sentences: the chassis, the floor plan, what makes it this owner's van. Shown in Google results." },
    },
    {
      name: "description",
      label: "About this build",
      type: "richText",
      editor: answerText,
      admin: { description: "The full write-up: who it was built for, the systems in it, what is unusual about it." },
    },
    {
      name: "slug",
      label: "Web address",
      type: "text",
      unique: true,
      index: true,
      hooks: { beforeValidate: [fillSlug] },
      admin: {
        position: "sidebar",
        description: "papagovans.com/projects/this-part/. Filled in from the build name when you first save. Changing it after publishing breaks links people already have.",
      },
    },
    {
      name: "finished",
      label: "Date finished",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "MMMM d, yyyy" },
        description: "Builds are listed newest first.",
      },
    },
  ],
};
