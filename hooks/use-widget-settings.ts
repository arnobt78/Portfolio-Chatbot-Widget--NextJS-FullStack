import { useState, useEffect, useCallback } from "react";
import type { FontSize, WidgetPosition, Theme } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * React hook for managing widget settings (theme, font size, position)
 * Persists settings to localStorage and provides reactive updates
 */
export function useWidgetSettings() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
    return stored || "system";
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "medium";
    const stored = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as FontSize;
    return stored || "medium";
  });

  const [position, setPositionState] = useState<WidgetPosition>(() => {
    if (typeof window === "undefined") return "bottom-right";
    const stored = localStorage.getItem(STORAGE_KEYS.WIDGET_POSITION) as WidgetPosition;
    return stored || "bottom-right";
  });

  // Apply theme to document
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const widget = document.getElementById("cb");
    const widgetReact = document.getElementById("cb-react");

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      widget?.classList.add("dark");
      widgetReact?.classList.add("dark");
    } else {
      root.classList.remove("dark");
      widget?.classList.remove("dark");
      widgetReact?.classList.remove("dark");
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      const widget = document.getElementById("cb");
      const widgetReact = document.getElementById("cb-react");
      if (mediaQuery.matches) {
        root.classList.add("dark");
        widget?.classList.add("dark");
        widgetReact?.classList.add("dark");
      } else {
        root.classList.remove("dark");
        widget?.classList.remove("dark");
        widgetReact?.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const setFontSize = useCallback((newSize: FontSize) => {
    setFontSizeState(newSize);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, newSize);
  }, []);

  const setPosition = useCallback((newPosition: WidgetPosition) => {
    setPositionState(newPosition);
    localStorage.setItem(STORAGE_KEYS.WIDGET_POSITION, newPosition);
  }, []);

  return {
    theme,
    fontSize,
    position,
    setTheme,
    setFontSize,
    setPosition,
  };
}
