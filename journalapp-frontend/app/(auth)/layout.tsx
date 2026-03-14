import type { ReactNode } from "react";
import { AuthNotebookShell } from "@/app/components/auth/AuthNotebookShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthNotebookShell>{children}</AuthNotebookShell>;
}
