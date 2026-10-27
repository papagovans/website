"use client";
/* A YouTube video playing silently behind a hero, the way papagovans.com's
   home page runs its shop tour. The hero's photo sits underneath: it shows
   while the video loads, and stays for anyone who has asked their system to
   reduce motion. The video fades in only once YouTube says it is playing, so
   a stalled or blocked video leaves the photo up rather than a black box. */
import { useEffect, useRef, useState } from "react";

const idOf = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
/* "?t=6" (or "start=6") on the CMS link skips an opening: the video starts
   there and loops back there, never to 0:00 (owner 2026-10-27, the About
   video's logo intro). */
const startOf = (url: string) => Number(url.match(/[?&](?:t|start)=(\d+)/)?.[1] ?? 0);

export function HeroVideo({ url }: { url: string }) {
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => setOn(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const start = startOf(url);
  useEffect(() => {
    let duration = 0;
    const seek = () => ref.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [start, true], id: 1, channel: "widget" }), "*");
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      try {
        const info = JSON.parse(e.data)?.info;
        if (!info) return;
        if (info.duration) duration = info.duration;
        const t = info.currentTime;
        if (start && typeof t === "number") {
          // Back to the start point just before the end, and if YouTube's own loop got to 0:00 first.
          if ((duration && t > duration - 0.7) || t < start - 1) seek();
          else if (info.playerState === 1 || t >= start) setShown(true);
        } else if (info.playerState === 1) setShown(true);
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [start]);
  const id = idOf(url);
  if (!id || !on) return null;
  const q = `autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1${start ? `&start=${start}` : ""}`;
  return (
    <iframe
      className={shown ? "hero-video is-on" : "hero-video"}
      src={`https://www.youtube-nocookie.com/embed/${id}?${q}`}
      title="Papago Vans shop tour"
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      aria-hidden="true"
      ref={ref}
      /* Asks the player to report its state; "playing" is what fades it in. */
      onLoad={() => ref.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")}
    />
  );
}

/* A short silent clip hosted on the site, desktop only: a phone keeps the
   photo and downloads nothing. It loads after the page has, and fades in
   once it is actually playing, so a slow connection only ever sees the photo. */
export function HeroFileVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(min-width: 1000px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.muted = true; // React does not set this on a server-rendered video, and browsers only autoplay muted ones
    el.autoplay = true; // the browser starts it when ready, and again when a background tab comes forward
    el.src = src;
    el.play().catch(() => {}); // blocked autoplay just leaves the photo up
  }, [src]);
  return (
    <video
      ref={ref}
      className={shown ? "hero-video hero-file is-on" : "hero-video hero-file"}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setShown(true)}
    />
  );
}
