import dynamic from "next/dynamic";
import { JournalAppSkeleton } from "@/app/components/journal/JournalAppSkeleton";

const JournalApp = dynamic(
  () =>
    import("@/app/components/journal/JournalApp").then(
      (module) => module.JournalApp
    ),
  {
    loading: () => <JournalAppSkeleton />,
  }
);

export default function JournalPage() {
  return <JournalApp />;
}
