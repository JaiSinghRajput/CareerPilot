"use client";

import { useMode } from "./mode-provider";

export function ModeToggle() {
  const { mode, toggleMode } = useMode();

  return (
    <div className="flex items-center space-x-2 bg-surface-hover p-1 rounded-lg border border-border">
      <button
        onClick={() => mode !== "manual" && toggleMode()}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === "manual"
            ? "bg-surface text-text-primary shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        Manual
      </button>
      <button
        onClick={() => mode !== "chat" && toggleMode()}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === "chat"
            ? "bg-surface text-text-primary shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        AI Chat
      </button>
    </div>
  );
}
