"use client";
/* Sets data-loaded on <html> once the page has finished loading, so the
   decorative textures in globals.css wait instead of competing with the
   headline for bandwidth. */
import { useEffect } from "react";

export function LoadedFlag() {
  useEffect(() => {
    const set = () => document.documentElement.setAttribute("data-loaded", "");
    if (document.readyState === "complete") set();
    else addEventListener("load", set, { once: true });
  }, []);
  return null;
}
