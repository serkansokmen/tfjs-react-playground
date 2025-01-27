"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const themes: Theme[] = ["light", "dark"];

function usePrefersDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    setPrefersDarkMode(
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    // I write this into a function for better visibility
    const handleResize = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    mediaQuery.addEventListener("change", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return {
    prefersDarkMode,
  };
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const prefersDarkMode = usePrefersDarkMode();
  const currentThemeIndex = themes.indexOf(theme as Theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (prefersDarkMode && theme === "system") {
      setTheme("dark");
    } else if (!prefersDarkMode && theme === "system") {
      setTheme("light");
    }
    setIsMounted(true);
  }, [prefersDarkMode, setTheme, theme]);

  return (
    isMounted && (
      <Button
        data-cy="mode-toggle"
        variant="outline"
        size="icon"
        onClick={() => setTheme(nextTheme)}
      >
        {theme === "dark" && <SunIcon className="h-[1.2rem] w-[1.2rem]" />}
        {theme === "light" && <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  );
}
