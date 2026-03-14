"use client";

import Link from "next/link";
import { BookOpenText, LogOut, Moon, SunMedium } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { toggleTheme, useTheme } from "@/lib/theme";
import { Tooltip } from "../ui/Tooltip";

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]";

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const nextThemeLabel = theme === "dark" ? "light" : "dark";

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  return (
    <header className="pb-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Tooltip label="Journal" align="end">
          <Link
            aria-label="Journal"
            className={`group ${iconButtonClass} ${
              pathname === "/journal" ? "bg-[var(--surface-muted)] text-[var(--text)]" : ""
            }`}
            href="/journal"
          >
            <BookOpenText className="size-3.5" strokeWidth={1.7} />
          </Link>
        </Tooltip>
        <Tooltip label={`Switch to ${nextThemeLabel} theme`} align="end">
          <button
            aria-label={`Switch to ${nextThemeLabel} theme`}
            className={`group ${iconButtonClass}`}
            type="button"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <SunMedium className="size-3.5" strokeWidth={1.7} />
            ) : (
              <Moon className="size-3.5" strokeWidth={1.7} />
            )}
          </button>
        </Tooltip>
        <Tooltip label="Log out" align="end">
          <button
            aria-label="Log out"
            className={`group ${iconButtonClass}`}
            type="button"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" strokeWidth={1.7} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
