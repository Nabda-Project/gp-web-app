"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "@/services/storage";

type ThemeContextValue = {
  isDarkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
  document.documentElement.style.colorScheme = enabled ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const settings = tokenStorage.getSettings();
    setIsDarkMode(settings.isDarkMode);
    applyTheme(settings.isDarkMode);
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
    applyTheme(enabled);
    const settings = tokenStorage.getSettings();
    tokenStorage.setSettings({ ...settings, isDarkMode: enabled });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const value = useMemo(() => ({ isDarkMode, setDarkMode, toggleDarkMode }), [isDarkMode, setDarkMode, toggleDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
