import type { Access, CollectionConfig } from "payload";

import { adminOnly, adminOnlyField, isAdmin } from "./access";

const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  return isAdmin(user) ? true : { id: { equals: user.id } };
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Settings",
    description:
      "Who can sign in. To add someone, create them here with a starting password and send it to them; they can change it under their own account.",
  },
  access: { read: adminOrSelf, create: adminOnly, update: adminOrSelf, delete: adminOnly },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      // Only an admin hands out roles, so nobody promotes themselves.
      access: { create: adminOnlyField, update: adminOnlyField },
      options: [
        { label: "Editor: writes, edits and publishes content", value: "editor" },
        { label: "Admin: everything, including who can sign in", value: "admin" },
      ],
    },
  ],
  hooks: {
    // The very first account is the one that sets the site up, so it is an
    // admin. Otherwise the role box above (admin-only) leaves it an editor
    // and nobody can ever manage logins.
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === "create" && (await req.payload.count({ collection: "users", req })).totalDocs === 0) {
          data.role = "admin";
        }
        return data;
      },
    ],
    beforeDelete: [
      ({ req, id }) => {
        if (req.user && String(req.user.id) === String(id)) {
          throw new Error("You cannot delete the account you are signed in with.");
        }
      },
    ],
  },
};
