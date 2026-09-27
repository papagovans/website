"use client";
/* Shows one of its photos per page view, the next one each time the same
   visitor comes back (1, 2, 3, 1...), and slides it up the first time the
   box is mostly on screen. Nothing shows until the pick is made, so the
   wrong photo never flashes. Browser storage is only a convenience: if it
   is blocked, the first photo shows every time. */
import { useEffect, useRef, useState, type ReactNode } from "react";

const KEY = "papago-popup-turn";

export function PopUp({ className, items }: { className: string; items: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(-1);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let turn = 0;
    try {
      turn = Number(localStorage.getItem(KEY)) || 0;
      localStorage.setItem(KEY, String(turn + 1));
    } catch {}
    setShown(turn % items.length);
  }, [items.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setInView(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={inView && shown >= 0 ? `${className} is-in` : className}>
      {items.map((item, i) => (
        <span className="jp" hidden={i !== shown} key={i}>
          {item}
        </span>
      ))}
    </div>
  );
}
