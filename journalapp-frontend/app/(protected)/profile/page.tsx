import dynamic from "next/dynamic";
import { ProfilePanelSkeleton } from "@/app/components/profile/ProfilePanelSkeleton";

const ProfilePanel = dynamic(
  () =>
    import("@/app/components/profile/ProfilePanel").then(
      (module) => module.ProfilePanel
    ),
  {
    loading: () => <ProfilePanelSkeleton />,
  }
);

export default function ProfilePage() {
  return <ProfilePanel />;
}
