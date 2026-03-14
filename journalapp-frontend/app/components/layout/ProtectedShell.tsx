"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { AuthGuard } from "../auth/AuthGuard";
import { AppNavbar } from "./AppNavbar";
import { APP_THEME_DARK, APP_THEME_LIGHT } from "./app-shell-theme";

type ProtectedShellProps = {
  children: React.ReactNode;
};

export function ProtectedShell({ children }: ProtectedShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const shellTheme = theme === "dark" ? APP_THEME_DARK : APP_THEME_LIGHT;

  if (pathname === "/journal") {
    return (
      <AuthGuard>
        <div className="min-h-screen" style={shellTheme}>
          {children}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div
        className="min-h-screen min-h-[100svh] bg-[var(--bg)] px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5"
        style={shellTheme}
      >
        <div className="mx-auto w-full lg:w-fit lg:max-w-[calc(100vw-40px)]">
          <AppNavbar />
          <div className="min-h-[calc(100svh-28px)] w-full overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] lg:w-fit lg:max-w-[calc(100vw-40px)]">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
