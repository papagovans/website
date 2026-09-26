"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ExploreTheVan.module.css";

/*
 * Explore The Van: the home page's interactive interior.
 *
 * A standalone copy of the builder's 3D van (build.papagovans.com), with the
 * five things buyers inspect labelled on the model. Picking a label flies
 * the camera in to that feature and opens a short description. "Walk
 * inside" drops the visitor at eye height in the aisle.
 *
 * Nothing here talks to the builder. The model, light map and poster live
 * in /public/explore-the-van/ and are this site's own copies; refreshing
 * them is a file copy (see README in the kit).
 *
 * Scroll-to-zoom is off on purpose: on a long home page it would trap the
 * visitor's scrolling inside the viewer. The labels do the zooming.
 */

const ASSETS = "/explore-the-van";
const MODEL_VIEWER_SRC =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer@4/dist/model-viewer.min.js";
const OVERVIEW = { target: "auto auto auto", orbit: "35deg 65deg 70%" };

/*
 * Positions are metres in the model's own coordinates, picked off the
 * surface of Build 1 (El Capitan). A new model needs new positions.
 * Copy is a draft for Tim's sign-off: it states only what the model shows.
 */
const FEATURES = [
  {
    id: "bed",
    label: "Bed",
    title: "Full-width rear bed",
    copy: "Runs across the back of the van, the full width of the Sprinter, with the space underneath opening to the rear doors.",
    position: "0.9m 1.2m -1.2m",
    normal: "0m 1m 0m",
    view: { target: "0.9m 1.1m -1.35m", orbit: "-75deg 42deg 3.4m" },
  },
  {
    id: "bathroom",
    label: "Bathroom",
    title: "Enclosed bathroom",
    copy: "A shower and toilet behind a glass door, between the bed and the kitchen, so nobody walks outside at 2 a.m.",
    position: "2.45m 1.3m -1.6m",
    normal: "0m 0m 1m",
    view: { target: "2.45m 0.8m -1.9m", orbit: "30deg 20deg 2.6m" },
  },
  {
    id: "kitchen",
    label: "Kitchen",
    title: "Galley kitchen",
    copy: "A two-burner cooktop, a sink with a pull-down faucet and a front-opening fridge, on a wood counter with a fold-out extension.",
    position: "2.65m 1.0m -0.76m",
    normal: "0m 1m 0m",
    view: { target: "2.9m 0.9m -1.0m", orbit: "25deg 45deg 2.2m" },
  },
  {
    id: "storage",
    label: "Storage",
    title: "Storage that closes",
    copy: "Overhead cabinets run both sides of the van, with more under the counter and beneath the bed, so gear is put away rather than piled up.",
    position: "3.9m 1.86m -1.75m",
    normal: "0m 0m 1m",
    view: { target: "3.6m 1.6m -1.7m", orbit: "25deg 75deg 2.4m" },
  },
  {
    id: "power",
    label: "Power",
    title: "Power system",
    copy: "The electrical panel above the fridge shows battery and solar at a glance. Lithium power runs the van without a hookup.",
    position: "2.97m 1.87m -1.85m",
    normal: "0m 0m 1m",
    view: { target: "2.97m 1.8m -1.85m", orbit: "15deg 80deg 1.3m" },
  },
] as const;

type Feature = (typeof FEATURES)[number];

/* Walking the aisle, same numbers as the builder. The floor is at 0.12. */
const WALK = {
  eye: 1.62,
  x: [1.85, 4.25] as const,
  z: [-1.45, -1.1] as const,
  start: { x: 4.2, z: -1.28, heading: 90 },
  gaze: 78,
  step: 0.1,
  turnDeg: 5,
};

type ModelViewerElement = HTMLElement & {
  cameraTarget: string;
  cameraOrbit: string;
  getCameraOrbit(): { theta: number; phi: number; radius: number };
};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.HTMLAttributes<HTMLElement> & Record<string, unknown>;
    }
  }
}

const clamp = (v: number, [lo, hi]: readonly [number, number]) =>
  Math.min(hi, Math.max(lo, v));
const rad = (deg: number) => (deg * Math.PI) / 180;

export default function ExploreTheVan() {
  const viewer = useRef<ModelViewerElement>(null);
  const [active, setActive] = useState<Feature | null>(null);
  const [walking, setWalking] = useState(false);
  const pose = useRef({ x: 0, z: 0, heading: 0, phi: 0 });
  const frame = useRef<HTMLDivElement>(null);

  /* The viewer's script is 290 KB compressed, the heaviest thing on the page,
     and most visitors never scroll this far. It loads once the section is
     within a screen or so of view AND the visitor has scrolled, tapped or
     moved the mouse, which a real visitor has always done by the time they
     get here. Until then the poster stands in (see :not(:defined) in the
     module CSS). */
  const [loadViewer, setLoadViewer] = useState(false);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let near = false;
    let touched = false;
    const events = ["scroll", "pointerdown", "pointermove", "keydown", "touchstart"] as const;
    const stop = () => {
      io.disconnect();
      events.forEach((e) => window.removeEventListener(e, onInput));
    };
    const go = () => {
      if (near && touched) {
        setLoadViewer(true);
        stop();
      }
    };
    const onInput = () => {
      touched = true;
      go();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          near = true;
          go();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    return stop;
  }, []);

  const aim = (target: string, orbit: string) => {
    const el = viewer.current;
    if (!el) return;
    el.cameraTarget = target;
    el.cameraOrbit = orbit;
  };

  const show = (f: Feature) => {
    setWalking(false);
    setActive(f);
    aim(f.view.target, f.view.orbit);
  };

  const reset = useCallback(() => {
    setActive(null);
    setWalking(false);
    aim(OVERVIEW.target, OVERVIEW.orbit);
  }, []);

  /* The camera sits a centimetre behind its target: orbiting the target is
   * turning your head, moving it is walking. Pose is kept here, not read off
   * the viewer, because the viewer glides and a held key would lose steps. */
  const place = useCallback(() => {
    const { x, z, heading, phi } = pose.current;
    aim(`${x}m ${WALK.eye}m ${z}m`, `${heading}rad ${phi}rad 0.01m`);
  }, []);

  const walk = useCallback((forward: number, turn: number) => {
    const p = pose.current;
    p.heading += rad(turn * WALK.turnDeg);
    p.x = clamp(p.x - Math.sin(p.heading) * forward * WALK.step, WALK.x);
    p.z = clamp(p.z - Math.cos(p.heading) * forward * WALK.step, WALK.z);
    place();
  }, [place]);

  const startWalk = () => {
    const { x, z, heading } = WALK.start;
    pose.current = { x, z, heading: rad(heading), phi: rad(WALK.gaze) };
    setActive(null);
    setWalking(true);
  };

  // Placed after the render that loosens the orbit limits, or the viewer
  // clamps the starting pose to the overview's limits.
  useEffect(() => {
    if (walking) place();
  }, [walking, place]);

  // Dragging to look changes the heading; the next step follows it.
  useEffect(() => {
    const el = viewer.current;
    if (!el || !walking) return;
    const onChange = (e: Event) => {
      if ((e as CustomEvent<{ source: string }>).detail.source !== "user-interaction") return;
      const { theta, phi } = el.getCameraOrbit();
      pose.current.heading = theta;
      pose.current.phi = phi;
    };
    el.addEventListener("camera-change", onChange);
    return () => el.removeEventListener("camera-change", onChange);
  }, [walking]);

  // Capture phase, so arrows beat the viewer's own orbit keys and the page
  // scroll. Only while walking; Esc leaves the walk or a feature close-up.
  useEffect(() => {
    if (!walking && !active) return;
    const keys: Record<string, [number, number]> = {
      ArrowUp: [1, 0], w: [1, 0], ArrowDown: [-1, 0], s: [-1, 0],
      ArrowLeft: [0, 1], a: [0, 1], ArrowRight: [0, -1], d: [0, -1],
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return reset();
      if (!walking) return;
      const k = keys[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!k) return;
      e.preventDefault();
      e.stopPropagation();
      walk(...k);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [walking, active, walk, reset]);

  return (
    <div className={styles.root}>
      {loadViewer && <Script type="module" src={MODEL_VIEWER_SRC} strategy="afterInteractive" />}

      <div className={styles.frame} ref={frame}>
      <div className={styles.stage}>
        <model-viewer
          ref={viewer}
          className={styles.viewer}
          src={`${ASSETS}/van.glb`}
          poster={`${ASSETS}/poster.webp`}
          environment-image={`${ASSETS}/studio.hdr`}
          alt="Interactive 3D interior of a Papago Vans Sprinter camper conversion"
          camera-orbit={OVERVIEW.orbit}
          /* The 0.5m floor matters: the viewer's default minimum distance is the
             full-van framing, which would silently cancel every close-up. */
          min-camera-orbit={walking ? "-Infinity 35deg 0.01m" : "auto auto 0.5m"}
          max-camera-orbit={walking ? "Infinity 145deg 0.01m" : "auto 88deg auto"}
          field-of-view={walking ? "70deg" : "auto"}
          camera-controls=""
          disable-zoom=""
          touch-action="pan-y"
          interaction-prompt="none"
          shadow-intensity="1.5"
          shadow-softness="0.4"
          exposure="0.9"
        >
          {!walking &&
            FEATURES.map((f) => (
              <button
                key={f.id}
                type="button"
                slot={`hotspot-${f.id}`}
                data-position={f.position}
                data-normal={f.normal}
                data-visibility-attribute="visible"
                className={`${styles.hotspot} ${active?.id === f.id ? styles.hotspotOn : ""}`}
                onClick={() => show(f)}
                aria-label={`Show the ${f.label.toLowerCase()}`}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.hotspotLabel}>{f.label}</span>
              </button>
            ))}
        </model-viewer>

        <div className={styles.topBar}>
          {(active || walking) && (
            <button type="button" className={styles.pill} onClick={reset}>
              ← Full view
            </button>
          )}
          {!walking && (
            <button type="button" className={`${styles.pill} ${styles.pillGold}`} onClick={startWalk}>
              Walk inside
            </button>
          )}
        </div>

        <p className={styles.hint}>
          {walking ? (
            <>Drag to look<span className={styles.wide}> · Arrows to walk · Esc to exit</span></>
          ) : (
            <>Drag to turn<span className={styles.wide}> · Tap a label to look closer</span></>
          )}
        </p>

        {walking && <WalkPad onStep={walk} />}
      </div>

      {/* Outside the stage so a phone can drop it below the model instead of
          covering the feature it describes. Desktop floats it over the stage. */}
      {active && (
        <div className={styles.card} role="status">
          <p className={styles.cardKicker}>{active.label}</p>
          <h3 className={styles.cardTitle}>{active.title}</h3>
          <p className={styles.cardCopy}>{active.copy}</p>
        </div>
      )}
      </div>

      {/* The same five, as plain buttons: for phones, keyboards and anyone
          who does not think to tap a dot on a 3D model. */}
      <div className={styles.chips} aria-label="Inspect a feature">
        {FEATURES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.chip} ${active?.id === f.id ? styles.chipOn : ""}`}
            aria-pressed={active?.id === f.id}
            onClick={() => (active?.id === f.id ? reset() : show(f))}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* On-screen arrows for touch devices. Hold to keep walking. */
function WalkPad({ onStep }: { onStep: (forward: number, turn: number) => void }) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  const hold = (forward: number, turn: number, label: string, glyph: string, area: string) => (
    <button
      type="button"
      aria-label={label}
      style={{ gridArea: area }}
      className={styles.padKey}
      onPointerDown={(e) => {
        e.preventDefault();
        stop();
        onStep(forward, turn);
        timer.current = setInterval(() => onStep(forward, turn), 60);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {glyph}
    </button>
  );
  return (
    <div className={styles.pad}>
      {hold(1, 0, "Walk forward", "↑", "up")}
      {hold(0, 1, "Turn left", "←", "left")}
      {hold(-1, 0, "Walk back", "↓", "down")}
      {hold(0, -1, "Turn right", "→", "right")}
    </div>
  );
}
