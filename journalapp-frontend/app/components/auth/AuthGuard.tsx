"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { useClientReady } from "@/lib/use-client-ready";
import { LoadingCard } from "../ui/LoadingCard";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clientReady = useClientReady();
  const loggedIn = clientReady && isLoggedIn();

  useEffect(() => {
    if (!clientReady) {
      return;
    }

    if (!loggedIn) {
      const nextPath = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${nextPath}`);
    }
  }, [clientReady, loggedIn, pathname, router]);

  if (!clientReady || !loggedIn) {
    return (
      <LoadingCard
        label="Checking"
        title="One moment"
        copy="Making sure you're signed in."
      />
    );
  }

  return <>{children}</>;
}
