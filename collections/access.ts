import type { Access, FieldAccess } from "payload";

type RoleUser = { role?: string | null } | null | undefined;

export const isAdmin = (user: RoleUser) => user?.role === "admin";
export const signedIn: Access = ({ req }) => Boolean(req.user);
export const adminOnly: Access = ({ req }) => isAdmin(req.user);
export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req.user);
