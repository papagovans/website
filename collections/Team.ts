import type { CollectionConfig } from "payload";

import { signedIn } from "./access";

const rebuildAll = async () => {
  try {
    (await import("next/cache")).revalidatePath("/", "layout");
  } catch {
    // Outside a Next request (an import script) there is no cache to clear.
  }
};

/* In page order. Small departments share a line on the About page (see
   TEAM_ROWS in components/PageSections.tsx). A department added here and not
   placed there still appears, in its own row, at the end. */
export const DEPARTMENTS = [
  "Owners", "Administration", "Finance", "Sales", "Marketing",
  "Builders", "Service Department", "Painters", "Inventory", "CNC Specialists",
] as const;

export const Team: CollectionConfig = {
  slug: "team",
  labels: { singular: "Team Member", plural: "Team" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "role", "department", "active", "photo"],
    description:
      "The people on the About page. Drag the handle on the left of a row to change the order within a department. Removing someone takes them off the page.",
    listSearchableFields: ["name", "role"],
  },
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  // Drag-and-drop ordering in the list view.
  orderable: true,
  // A Team section can sit on any page, so a change rebuilds them all.
  hooks: { afterChange: [rebuildAll], afterDelete: [rebuildAll] },
  fields: [
    { name: "name", type: "text", required: true, admin: { description: "As it should appear, e.g. \"Jerry Suhrstedt\" or just \"Tim\"." } },
    {
      name: "active",
      label: "Show on the website",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", description: "Untick when someone leaves. They come off the About page but their photo and details are kept, so ticking it again brings them back." },
    },
    { name: "role", label: "Job title", type: "text", admin: { description: "Optional. Leave blank if not known yet." } },
    {
      name: "department",
      type: "select",
      admin: { description: "Optional. Anyone without one is shown in a Team row at the end." },
      options: DEPARTMENTS.map((d) => ({ label: d, value: d })),
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "A head-and-shoulders photo. Any shape works: it is cropped to a circle on the page. Without one, a plain blue circle shows until a photo is added." },
    },
  ],
};
