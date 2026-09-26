"use client";
/*
 * Two layers of the same size, lined up pixel for pixel: the background
 * photo behind, a cut-out of the subject in front. Dragging brings the
 * background in from the left, so the forest appears behind the van while
 * the van never moves. Starts with no background at all.
 *
 * The control is a real range input stretched over the picture, so touch,
 * mouse, arrow keys and screen readers all work without custom handling.
 */
import { useState, type ReactNode } from "react";

export function RevealSlider({
  back,
  front,
  label,
  handle,
}: {
  back: ReactNode;
  front: ReactNode;
  label: string;
  handle: string;
}) {
  const [pos, setPos] = useState(0);
  return (
    <div className="reveal" style={{ ["--pos" as string]: `${pos}%` }}>
      <div className="reveal-back">{back}</div>
      <div className="reveal-front">{front}</div>
      <div className="reveal-handle" aria-hidden="true">
        <span>&#8592; {handle} &#8594;</span>
      </div>
      <input
        className="reveal-input"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${pos}% of the background shown`}
      />
    </div>
  );
}
