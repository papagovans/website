"use client";
/* Tabs for a tier page's build features and a la carte upgrades. Every panel
   is in the HTML, so Google and a reader with no JavaScript get all of it;
   the buttons only choose which one shows. */
import { useState } from "react";

export function Tabs({ id, tabs, className }: { id: string; tabs: { label: string; panel: React.ReactNode }[]; className?: string }) {
  const [open, setOpen] = useState(0);
  const key = (e: React.KeyboardEvent, i: number) => {
    const to = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (to === null) return;
    const n = (to + tabs.length) % tabs.length;
    setOpen(n);
    document.getElementById(`${id}-tab-${n}`)?.focus();
  };
  return (
    <div className={className ? `tabs ${className}` : "tabs"}>
      <div className="tabs-list" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            id={`${id}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={open === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={open === i ? 0 : -1}
            onClick={() => setOpen(i)}
            onKeyDown={(e) => key(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} hidden={open !== i} className="tabs-panel">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
