"use client";
/* The phone menu. Below 1000px the header's nav is hidden and this button
   takes over: a full-screen panel with every section, both phone lines and
   the calendar. Closes on a link, on Escape, and on the button again. Focus
   moves into the panel when it opens and back to the button when it closes,
   and the page behind does not scroll while it is open. */
import { useEffect, useRef, useState } from "react";

type Link = { label: string; href: string; external?: boolean };

export function MobileMenu({
  links,
  phones,
  cta,
}: {
  links: Link[];
  phones: { label: string; number: string; href: string }[];
  cta: Link;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      button.current?.focus();
    };
  }, [open]);

  const ext = (l: Link) => (l.external ? { target: "_blank", rel: "noopener" } : {});

  return (
    <>
      <button
        ref={button}
        className={open ? "hamburger is-open" : "hamburger"}
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <div
        id="mobile-menu"
        ref={panel}
        className="mobile-menu"
        hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <nav aria-label="Menu">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} {...ext(l)}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-foot">
          <a href={cta.href} {...ext(cta)} className="btn btn-gold btn-block">
            {cta.label} <span className="arw">&#8853;</span>
          </a>
          {phones.map((p) => (
            <a key={p.href} href={p.href} className="mobile-menu-phone">
              <span>{p.label}</span> {p.number}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
