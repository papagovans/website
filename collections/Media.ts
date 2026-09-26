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
  /*
   * Every photo is stored at three widths, each in AVIF and WebP. Pages ask
   * for the smallest one that is still sharp where it is shown, and browsers
   * take AVIF when they can (about 25% smaller) and WebP when they cannot.
   *
   * The settings were measured, not guessed: on real build photos, AVIF 55 at
   * effort 7 scores higher on SSIM than the AVIF the site served before, in a
   * smaller file. Going to 50 saves another 15% and visibly softens detail,
   * which is why it stops here. WebP 78 is the fallback the site always used.
   */
  upload: {
    mimeTypes: ["image/*"],
    focalPoint: true,
    // The master copy: capped at 2400px so a 12MP phone photo is not stored
    // at 5MB, kept at a high quality because every size is cut from it.
    formatOptions: { format: "webp", options: { quality: 86, effort: 6 } },
    resizeOptions: { width: 2400, withoutEnlargement: true },
    imageSizes: [
      ...([
        ["thumb", 400],
        ["card", 800],
        ["large", 1600],
      ] as const).flatMap(([name, width]) => [
        { name, width, formatOptions: { format: "webp" as const, options: { quality: 78, effort: 6 } } },
        { name: `${name}Avif`, width, formatOptions: { format: "avif" as const, options: { quality: 55, effort: 7 } } },
      ]),
    ],
    adminThumbnail: "thumb",
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
