"use client";
/* A silent looping video that does not load until it is near the screen, so
   it costs the first page view nothing. The poster (the card's picture)
   shows until then, and stays for anyone who has asked their system to
   reduce motion. The source is attached and played by hand: a browser does
   not autoplay a video whose source arrives after the page has loaded. */
import { useEffect, useRef } from "react";

export function LoopVideo({ src, poster, className, label }: { src: string; poster?: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.src = src;
        el.play().catch(() => {}); // blocked autoplay just leaves the poster up
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-label={label} />;
}
