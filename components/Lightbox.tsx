"use client";
/* Click any photo on a build page to see it large (owner 2026-10-28). The
   page renders its own photos; each sits in a button carrying data-zoom with
   its place in `photos`, and one click handler here opens that one in a
   native <dialog>, which brings Escape-to-close and focus handling free.
   Arrows, arrow keys and a phone swipe step through the rest. */
import { useRef, useState, type ReactNode } from "react";

export function Lightbox({ photos, children }: { photos: { src: string; alt: string }[]; children: ReactNode }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const touchX = useRef(0);
  const [i, setI] = useState(0);
  const step = (d: number) => setI((n) => (n + d + photos.length) % photos.length);

  const open = (e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-zoom]");
    if (!btn) return;
    setI(Number(btn.dataset.zoom));
    dlg.current?.showModal();
  };

  const p = photos[i];
  return (
    <div onClick={open}>
      {children}
      <dialog
        ref={dlg}
        className="lightbox"
        aria-label="Photo viewer"
        onClick={(e) => e.target === e.currentTarget && dlg.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p && <img src={p.src} alt={p.alt} />}
        <button type="button" className="lb-close" aria-label="Close" onClick={() => dlg.current?.close()}>&times;</button>
        {photos.length > 1 && (
          <>
            <button type="button" className="lb-prev" aria-label="Previous photo" onClick={() => step(-1)}>&#8249;</button>
            <button type="button" className="lb-next" aria-label="Next photo" onClick={() => step(1)}>&#8250;</button>
            <span className="lb-count">{i + 1} / {photos.length}</span>
          </>
        )}
      </dialog>
    </div>
  );
}
