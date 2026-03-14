import dynamic from "next/dynamic";
import { AuthFormSkeleton } from "@/app/components/auth/AuthFormSkeleton";

const LoginForm = dynamic(
  () =>
    import("@/app/components/forms/LoginForm").then((module) => module.LoginForm),
  {
    loading: () => <AuthFormSkeleton mode="login" />,
  }
);

export default function LoginPage() {
  return <LoginForm />;
}
