"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "./theme-script";

// Site-wide light/dark theme. The value lives on <html data-theme="..."> so CSS
// variables in globals.css switch instantly. An inline script in layout.tsx
// (see theme-script.ts) applies the saved theme before first paint.

export type Theme = "dark" | "light";

const EVENT = "jrn-theme";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTheme() {
  setTheme(getTheme() === "light" ? "dark" : "light");
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // sync across tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}
