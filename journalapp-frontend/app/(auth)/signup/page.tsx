import dynamic from "next/dynamic";
import { AuthFormSkeleton } from "@/app/components/auth/AuthFormSkeleton";

const SignupForm = dynamic(
  () =>
    import("@/app/components/forms/SignupForm").then(
      (module) => module.SignupForm
    ),
  {
    loading: () => <AuthFormSkeleton mode="signup" />,
  }
);

export default function SignupPage() {
  return <SignupForm />;
}
