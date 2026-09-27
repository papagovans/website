"use client";
/*
 * Two layers of the same size, lined up pixel for pixel: the background
 * photo behind, a cut-out of the subject in front. Dragging the handle
 * brings the background in from the left, so the forest appears behind the
 * van while the van never moves. Starts with no background at all.
 *
 * Only the handle drags; a click elsewhere on the picture does nothing, so
 * the forest never jumps in. The handle and the edge of the forest are the
 * same number, so they never drift apart. A visually hidden range input
 * carries keyboard and screen reader control, and eases between steps.
 */
import { useRef, useState, type ReactNode } from "react";

export function RevealSlider({ back, front, ground, label, tag }: { back: ReactNode; front: ReactNode; ground?: ReactNode; label: string; tag: string }) {
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const r = frame.current!.getBoundingClientRect();
    setPos(Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)) * 10) / 10);
  };

  return (
    <div
      ref={frame}
      className={dragging ? "reveal is-dragging" : "reveal"}
      style={{ ["--pos" as string]: `${pos}%` }}
    >
      <div className="reveal-back">{back}</div>
      {/* Ground for the tyres, only on the side the forest has not reached. */}
      {ground && <div className="reveal-ground">{ground}</div>}
      <div className="reveal-front">{front}</div>
      <div
        className="reveal-handle"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => dragging && moveTo(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <span className="reveal-knob" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <p className="reveal-tag" aria-hidden="true">{tag}</p>
      <input
        className="reveal-input"
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${Math.round(pos)}% of the forest shown`}
      />
    </div>
  );
}
