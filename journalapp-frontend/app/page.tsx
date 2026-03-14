"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { LoadingCard } from "./components/ui/LoadingCard";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn() ? "/journal" : "/login");
  }, [router]);

  return (
    <main>
      <LoadingCard
        label="Journal"
        title="Opening..."
        copy="Taking you to the right page."
      />
    </main>
  );
}
