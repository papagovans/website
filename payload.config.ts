/**
 * The website's CMS. Staff sign in at /admin.
 *
 * Written for people who are not developers. Every collection has a plain
 * label and a one-line description, every field a help line, and the nav has
 * three groups: Content (what the public reads), Media Library (every photo),
 * Settings (who can sign in). Design lives in code; content lives here.
 *
 * Same stack as build.papagovans.com/admin, deliberately: one set of
 * habits for whoever maintains both.
 */
import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { editor } from "./collections/editor";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/* Schema changes need the direct connection, not the pooler. */
const connectionString =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " | Papago Vans Website" },
    // Component paths, resolved into app/(payload)/admin/importMap.js.
    // Regenerate with `npx payload generate:importmap` after changing them.
    components: {
      beforeNavLinks: ["/components/admin/PapagoLogo#NavLogo"],
      graphics: {
        Logo: "/components/admin/PapagoLogo#Logo",
        Icon: "/components/admin/PapagoLogo#Icon",
      },
    },
  },
  collections: [Pages, Posts, Media, Users],
  editor,
  db: postgresAdapter({
    pool: { connectionString },
    // Dev only: Drizzle syncs the schema straight to Neon. Generate
    // migrations before relying on this in production.
    push: process.env.NODE_ENV !== "production",
  }),
  plugins: [
    // Vercel's filesystem is read-only, so uploads live in Blob.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Photos are public, so serve them straight from Blob's CDN rather
      // than through a function on every request.
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  sharp,
});
