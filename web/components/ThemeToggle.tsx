"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

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
      className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95"
      aria-label={
        darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
      title={
        darkMode ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {darkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
    </button>
  );
}