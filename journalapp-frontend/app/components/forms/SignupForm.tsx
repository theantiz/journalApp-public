"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckboxField } from "./CheckboxField";
import { FormField } from "./FormField";
import { isApiError } from "@/lib/api";
import { signupUser } from "@/lib/public-api";
import type { SignupValues } from "@/lib/types";

const signupSchema = z.object({
  userName: z.string().min(3, "Choose a username with at least 3 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters for the password."),
  sentimentAnalysis: z.boolean(),
});

const inputClass =
  "min-h-[52px] w-full rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--line)] focus:ring-0";

const submitButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[16px] border-[0.5px] border-[var(--button-primary-bg)] bg-[var(--button-primary-bg)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--button-primary-text)] [font-family:var(--font-dm-mono),monospace] hover:bg-[var(--button-primary-hover)] disabled:cursor-progress disabled:opacity-70";

export function SignupForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      sentimentAnalysis: true,
    },
  });

  async function onSubmit(values: SignupValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await signupUser(values);
      setSuccessMessage("Account created. Redirecting...");
      window.setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (error) {
      setSubmitError(
        isApiError(error) ? error.message : "Unable to create your account."
      );
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-3">
        <h2 className="text-[clamp(2.5rem,4vw,3.2rem)] font-medium leading-[0.98] text-[var(--text-strong)] [font-family:var(--font-caveat),serif]">
          Glad you&apos;re here
        </h2>
        <p className="max-w-[28ch] text-[15px] leading-7 text-[var(--muted)]">
          Set up your account and start writing at your own pace.
        </p>
      </div>

      {submitError ? (
        <div className="rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[0.92rem] leading-6 text-[var(--danger)]">
          {submitError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[0.92rem] leading-6 text-[var(--text)]">
          {successMessage}
        </div>
      ) : null}

      <form
        className="grid gap-4 rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-5 py-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          label="Username"
          htmlFor="signup-userName"
          error={errors.userName?.message}
        >
          <input
            {...register("userName")}
            id="signup-userName"
            className={inputClass}
            autoComplete="username"
            placeholder="new-writer"
          />
        </FormField>

        <FormField label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <input
            {...register("email")}
            id="signup-email"
            className={inputClass}
            type="email"
            autoComplete="email"
            placeholder="writer@example.com"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="signup-password"
          error={errors.password?.message}
        >
          <input
            {...register("password")}
            id="signup-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </FormField>

        <CheckboxField
          label="Mood labels"
          description="Allow entries to be grouped by sentiment."
          error={errors.sentimentAnalysis?.message}
        >
          <input
            {...register("sentimentAnalysis")}
            className="mt-0.5 size-[18px] accent-[var(--text)]"
            type="checkbox"
          />
        </CheckboxField>

        <button className={submitButtonClass} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-[0.95rem] leading-6 text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          className="text-[var(--text-strong)] underline decoration-[rgba(23,20,16,0.2)] underline-offset-4"
          href="/login"
        >
          Sign in.
        </Link>
      </p>
    </section>
  );
}
