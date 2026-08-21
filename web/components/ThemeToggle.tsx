"use client";

import { useSyncExternalStore } from "react";

const THEME_EVENT = "theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem("theme") === "dark";
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const darkMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggleTheme = () => {
    const newDarkMode = !darkMode;

    document.documentElement.classList.toggle("dark", newDarkMode);

    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={
        darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
      title={
        darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}