"use client";
/* Sets data-scrolled on <html> once the page is 30px down, so the header on
   the full-bleed hero can take on its dark backing. */
import { useEffect } from "react";

export function ScrolledFlag() {
  useEffect(() => {
    const html = document.documentElement;
    const update = () => html.toggleAttribute("data-scrolled", scrollY > 30);
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  return null;
}
