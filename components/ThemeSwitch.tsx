"use client";

import { useEffect, useState } from "react";

/* Development-only control for picking a visual direction. It writes
 * data-theme on <html>, which is what app/projects/project.css keys off.
 * Delete this component and the .theme-switch block once a direction wins. */

const THEMES = [
  { id: "papago", label: "Papago" },
  { id: "geotrek", label: "Geotrek" },
  { id: "hybrid", label: "Hybrid" },
];

export default function ThemeSwitch() {
  const [theme, setTheme] = useState("hybrid");

  useEffect(() => {
    const saved = localStorage.getItem("pg-theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pg-theme", theme);
  }, [theme]);

  return (
    <div className="theme-switch">
      {THEMES.map((t) => (
        <button
          key={t.id}
          data-on={theme === t.id}
          onClick={() => setTheme(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
