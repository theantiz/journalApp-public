"use client";

import { Moon, SunMedium } from "lucide-react";
import { AuthRedirect } from "./AuthRedirect";
import { toggleTheme, useTheme } from "@/lib/theme";
import { APP_THEME_DARK, APP_THEME_LIGHT } from "../layout/app-shell-theme";
import { Tooltip } from "../ui/Tooltip";

type AuthNotebookShellProps = {
  children: React.ReactNode;
};

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]";

export function AuthNotebookShell({ children }: AuthNotebookShellProps) {
  const theme = useTheme();
  const shellTheme = theme === "dark" ? APP_THEME_DARK : APP_THEME_LIGHT;
  const nextThemeLabel = theme === "dark" ? "light" : "dark";

  return (
    <AuthRedirect>
      <div
        className="min-h-screen min-h-[100svh] bg-[var(--bg)] px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5"
        style={shellTheme}
      >
        <div className="mx-auto w-full lg:w-fit lg:max-w-[calc(100vw-40px)]">
          <div className="flex flex-wrap items-center justify-end gap-2 pb-2">
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
          </div>

          <div className="grid min-h-[calc(100svh-28px)] w-full overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] lg:w-fit lg:max-w-[calc(100vw-40px)] lg:grid-cols-[240px_auto] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b-[0.5px] border-[var(--line)] bg-[var(--bg)] px-5 py-5 max-lg:gap-5 lg:border-b-0 lg:border-r-[0.5px] lg:px-6 lg:py-6">
              <div className="grid gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                  Journal
                </p>
                <h1 className="text-[40px] font-medium leading-none text-[var(--text)] [font-family:var(--font-caveat),serif]">
                  Take your time.
                </h1>
                <p className="max-w-[18ch] text-[15px] leading-7 text-[var(--muted)]">
                  Sign in or create an account whenever you feel ready.
                </p>
              </div>
            </aside>

            <main className="min-h-0 min-w-0 bg-[var(--bg)]">
              <div className="scrollbar-gutter-stable flex h-full min-h-0 items-start justify-center overflow-auto p-4 lg:justify-start lg:p-0">
                <article className="flex min-h-[460px] w-full max-w-[720px] min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] sm:min-h-[560px] lg:h-full lg:w-auto lg:max-w-full lg:rounded-none lg:aspect-[297/420]">
                  <section className="scrollbar-gutter-stable min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
                    <div className="mx-auto w-full max-w-[420px]">{children}</div>
                  </section>
                </article>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
