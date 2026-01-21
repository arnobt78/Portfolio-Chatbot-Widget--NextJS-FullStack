import { useState, useEffect, useCallback } from "react";
import type { FontSize, WidgetPosition, Theme } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * React hook for managing widget settings (theme, font size, position)
 * Persists settings to localStorage and provides reactive updates
 */
export function useWidgetSettings() {
  // Initialize with "dark" as default to avoid hydration mismatch
  // Update from localStorage after mount
  const [theme, setThemeState] = useState<Theme>("dark");

  // Load theme from localStorage after mount, default to "dark" if not set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
      if (stored && (stored === "light" || stored === "dark")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(stored);
      } else {
        // Default to dark mode if no stored preference
        setThemeState("dark");
        localStorage.setItem(STORAGE_KEYS.THEME, "dark");
      }
    }
  }, []);

  // Initialize with "medium" to avoid hydration mismatch
  // Update from localStorage after mount
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  // Load fontSize from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as FontSize;
      if (stored && (stored === "small" || stored === "medium" || stored === "large")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFontSizeState(stored);
      }
    }
  }, []);

  // Initialize with "bottom-right" to avoid hydration mismatch
  // Update from localStorage after mount
  const [position, setPositionState] = useState<WidgetPosition>("bottom-right");

  // Load position from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.WIDGET_POSITION) as WidgetPosition;
      if (stored && (stored === "bottom-right" || stored === "bottom-left")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPositionState(stored);
      }
    }
  }, []);

  // Apply theme to widget elements
  // Apply dark class to BOTH html (for Tailwind dark: classes) AND widget container (for our CSS)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const widget = document.getElementById("cb");
    const widgetReact = document.getElementById("cb-react");

    // Determine if dark mode should be active
    // Simple toggle: dark = true, light = false
    const isDark = theme === "dark";

    // Apply dark class to HTML root (for Tailwind dark: classes to work)
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // ALSO apply dark class directly to widget containers (for our CSS overrides)
    // This ensures both Tailwind classes and our CSS rules work
    if (widget) {
      if (isDark) {
        widget.classList.add("dark");
      } else {
        widget.classList.remove("dark");
      }
    }
    
    if (widgetReact) {
      if (isDark) {
        widgetReact.classList.add("dark");
      } else {
        widgetReact.classList.remove("dark");
      }
    }
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
