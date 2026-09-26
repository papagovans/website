import type { CollectionConfig } from "payload";

import { signedIn } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Media Library" },
  admin: {
    group: "Media Library",
    description:
      "Every photo on the site. Upload straight from a phone or camera: images are resized and compressed automatically.",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  // A browser loads these files directly, so reads are public. Changes need a login.
  access: { read: () => true, create: signedIn, update: signedIn, delete: signedIn },
  // Deleting moves an image to Trash, where it can be restored.
  trash: true,
  upload: {
    mimeTypes: ["image/*"],
    focalPoint: true,
    formatOptions: { format: "webp", options: { quality: 82 } },
    // The article column is ~720px; 1600 covers it on a retina screen.
    resizeOptions: { width: 2400, withoutEnlargement: true },
    imageSizes: [
      { name: "card", width: 800, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "large", width: 1600, formatOptions: { format: "webp", options: { quality: 80 } } },
    ],
    adminThumbnail: "card",
  },
  fields: [
    {
      name: "alt",
      label: "Description",
      type: "text",
      required: true,
      admin: {
        description:
          'What the photo shows, in a sentence. Read aloud to blind visitors and used by Google. Example: "Galley with walnut countertop and induction cooktop".',
      },
    },
  ],
};
