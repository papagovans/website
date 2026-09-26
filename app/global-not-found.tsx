/*
 * The 404 for an address that matches no route at all, like /a/b/c/.
 * The site and the admin each have their own root layout, so there is no
 * single layout to wrap this in; Next renders it on its own, which is why
 * it brings its own styles, fonts and a header. Most wrong addresses never
 * reach it: one-segment paths, /blog/... and /projects/... land on
 * app/(frontend)/not-found.tsx inside the normal layout.
 */
import type { Metadata } from "next";
import "./(frontend)/globals.css";
import { NotFoundBody } from "@/components/NotFoundBody";
import { inter, prompt } from "@/lib/fonts";

export const metadata: Metadata = { title: "Page Not Found | Papago Vans", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${prompt.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <a href="/" className="logo" aria-label="Papago Vans home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/Group-278.svg" alt="Papago Vans" width="174" height="27" />
            </a>
          </div>
        </header>
        <NotFoundBody />
      </body>
    </html>
  );
}
