import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, FieldHook } from "payload";

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* Filled from the title the first time a document is saved, then left alone:
   an address is what Google and everyone's bookmarks point at. Never
   shortened, since one live post's address is 90 characters. */
export const fillSlug: FieldHook = ({ value, data }) =>
  value ? slugify(String(value)) : data?.title ? slugify(String(data.title)) : value;

/* Pages are prerendered. Publishing, unpublishing, renaming or deleting tells
   Next which ones to rebuild, so the change is live on the next visit. */
export function revalidator(pathFor: (slug: string) => string, listing?: string) {
  const run = async (doc: { slug?: string | null }, prev?: { slug?: string | null }) => {
    try {
      const { revalidatePath } = await import("next/cache");
      if (listing) revalidatePath(listing);
      if (doc.slug) revalidatePath(pathFor(doc.slug));
      if (prev?.slug && prev.slug !== doc.slug) revalidatePath(pathFor(prev.slug));
    } catch {
      // Outside a Next request (an import script) there is no cache to clear.
    }
  };
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
    if (doc._status === "published" || previousDoc?._status === "published") await run(doc, previousDoc);
    return doc;
  };
  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await run(doc);
    return doc;
  };
  return { afterChange: [afterChange], afterDelete: [afterDelete] };
}
