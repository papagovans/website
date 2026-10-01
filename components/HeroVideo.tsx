"use client";
/* A YouTube video playing silently behind a hero, the way papagovans.com's
   home page runs its shop tour. The hero's photo sits underneath: it shows
   while the video loads, and stays for anyone who has asked their system to
   reduce motion. The video fades in a moment after loading, so YouTube's own
   title flash is never seen. */
import { useEffect, useState } from "react";

const idOf = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];

export function HeroVideo({ url }: { url: string }) {
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => setOn(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const id = idOf(url);
  if (!id || !on) return null;
  const q = `autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3`;
  return (
    <iframe
      className={shown ? "hero-video is-on" : "hero-video"}
      src={`https://www.youtube-nocookie.com/embed/${id}?${q}`}
      title="Papago Vans shop tour"
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      aria-hidden="true"
      onLoad={() => setTimeout(() => setShown(true), 1500)}
    />
  );
}
