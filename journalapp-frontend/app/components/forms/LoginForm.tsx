"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./FormField";
import { isApiError } from "@/lib/api";
import { loginUser } from "@/lib/public-api";
import type { LoginValues } from "@/lib/types";

const loginSchema = z.object({
  userName: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

const inputClass =
  "min-h-[52px] h-[52px] w-full rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-4 py-3 text-base leading-1.4 text-[var(--text)] font-inherit align-text-top outline-none focus:border-[var(--line)] focus:ring-0 transition-none resize-none";

const submitButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[16px] border-[0.5px] border-[var(--button-primary-bg)] bg-[var(--button-primary-bg)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--button-primary-text)] [font-family:var(--font-dm-mono),monospace] hover:bg-[var(--button-primary-hover)] disabled:cursor-progress disabled:opacity-70";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitError(null);

    try {
      await loginUser(values);
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/journal");
    } catch (error) {
      setSubmitError(
        isApiError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to sign in right now."
      );
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-3">
        <h2 className="text-[clamp(2.5rem,4vw,3.2rem)] font-medium leading-[0.98] text-[var(--text-strong)] [font-family:var(--font-caveat),serif]">
          Welcome back
        </h2>
        <p className="max-w-[28ch] text-[15px] leading-7 text-[var(--muted)]">
          Your journal is right where you left it.
        </p>
      </div>

      {submitError ? (
        <div className="rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[0.92rem] leading-6 text-[var(--danger)]">
          {submitError}
        </div>
      ) : null}

      <form
        className="grid gap-4 rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-5 py-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          label="Username"
          htmlFor="login-userName"
          error={errors.userName?.message}
        >
          <input
            {...register("userName")}
            id="login-userName"
            className={inputClass}
            autoComplete="username"
            placeholder="Your name"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          error={errors.password?.message}
        >
          <input
            {...register("password")}
            id="login-password"
            className={inputClass}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </FormField>

        <button className={submitButtonClass} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-[0.95rem] leading-6 text-[var(--muted)]">
        New here?{" "}
        <Link
          className="text-[var(--text-strong)] underline decoration-[rgba(23,20,16,0.2)] underline-offset-4"
          href="/signup"
        >
          Create your account.
        </Link>
      </p>
    </section>
  );
}
