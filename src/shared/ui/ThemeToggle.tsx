"use client";
import React, { useEffect, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "dark"
    );
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle theme"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 13,
        color: "var(--color-text-dim)",
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
};
