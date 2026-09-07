"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type AppMode = "manual" | "chat";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mode: AppMode = pathname === "/chat" ? "chat" : "manual";

  const setMode = (newMode: AppMode) => {
    if (newMode === "chat" && mode !== "chat") {
      router.push("/chat");
    } else if (newMode === "manual" && mode !== "manual") {
      router.push("/dashboard");
    }
  };

  const toggleMode = () => {
    setMode(mode === "manual" ? "chat" : "manual");
  };

  const contextValue = { mode, setMode, toggleMode };

  if (!mounted) {
    return (
      <ModeContext.Provider value={contextValue}>
        <div style={{ opacity: 0 }}>{children}</div>
      </ModeContext.Provider>
    );
  }

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
