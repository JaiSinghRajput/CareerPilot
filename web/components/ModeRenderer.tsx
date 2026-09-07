"use client";

import { useMode } from "./mode-provider";
import { ChatInterface } from "./chat-interface";

export function ModeRenderer({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();

  return (
    <div className={mode === "manual" ? "p-6 flex-1 h-full" : "flex-1 h-full"}>
      {children}
    </div>
  );
}
