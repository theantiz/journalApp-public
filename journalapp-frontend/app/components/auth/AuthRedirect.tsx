"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { useClientReady } from "@/lib/use-client-ready";
import { LoadingCard } from "../ui/LoadingCard";

type AuthRedirectProps = {
  children: React.ReactNode;
};

export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();
  const clientReady = useClientReady();
  const loggedIn = clientReady && isLoggedIn();

  useEffect(() => {
    if (clientReady && loggedIn) {
      router.replace("/journal");
    }
  }, [clientReady, loggedIn, router]);

  if (!clientReady || loggedIn) {
    return (
      <LoadingCard
        label="Checking"
        title="One moment"
        copy="Checking if you're already signed in."
      />
    );
  }

  return <>{children}</>;
}
