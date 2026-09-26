import type { Metadata } from "next";
import { NotFoundBody } from "@/components/NotFoundBody";

export const metadata: Metadata = { title: "Page Not Found | Papago Vans" };

/* Inside the site's layout: header, newsletter band and footer included. */
export default function NotFound() {
  return <NotFoundBody />;
}
