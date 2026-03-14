"use client";

import { Moon, SunMedium } from "lucide-react";
import { toggleTheme, useTheme } from "@/lib/theme";

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? "light" : "dark";
  const baseClass =
    "inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-solid)] px-4 text-[0.74rem] uppercase tracking-[0.14em] text-[var(--text)] [font-family:var(--font-dm-mono),monospace] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]";

  return (
    <button
      aria-label={`Switch to ${nextThemeLabel} theme`}
      className={`${baseClass} ${compact ? "size-10 justify-center px-0" : ""}`}
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${nextThemeLabel} theme`}
    >
      {isDark ? (
        <SunMedium className="size-4" strokeWidth={1.8} />
      ) : (
        <Moon className="size-4" strokeWidth={1.8} />
      )}
      {compact ? null : <span>{isDark ? "Light" : "Dark"} mode</span>}
    </button>
  );
}
