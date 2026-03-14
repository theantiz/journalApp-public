import type { ReactNode } from "react";
import { ProtectedShell } from "@/app/components/layout/ProtectedShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
