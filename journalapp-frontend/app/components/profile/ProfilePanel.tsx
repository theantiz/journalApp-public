"use client";

import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isApiError } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import {
  deleteCurrentUser,
  getCurrentUserGreeting,
  getCurrentUserProfile,
  updateCurrentUserPassword,
  updateCurrentUser,
} from "@/lib/user-api";
import { CheckboxField } from "../forms/CheckboxField";
import { FormField } from "../forms/FormField";
import { Skeleton } from "../ui/Skeleton";
import type { PasswordChangeValues, ProfileValues } from "@/lib/types";

const profileSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  sentimentAnalysis: z.boolean(),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Use at least 6 characters for the password."),
    confirmPassword: z.string().min(1, "Confirm the new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type BannerState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

const inputClass =
  "min-h-[52px] w-full rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--line)] focus:ring-0";

const primaryButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[16px] border-[0.5px] border-[var(--button-primary-bg)] bg-[var(--button-primary-bg)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--button-primary-text)] [font-family:var(--font-dm-mono),monospace] hover:bg-[var(--button-primary-hover)] disabled:cursor-progress disabled:opacity-70";

const dangerButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--text)] [font-family:var(--font-dm-mono),monospace] hover:bg-[var(--surface-muted)] disabled:cursor-progress disabled:opacity-70";

export function ProfilePanel() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Loading...");
  const [profileName, setProfileName] = useState("Loading...");
  const [banner, setBanner] = useState<BannerState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      sentimentAnalysis: true,
    },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: {
      errors: passwordErrors,
      isSubmitting: isUpdatingPassword,
    },
  } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfileData() {
      setIsLoadingProfile(true);

      try {
        const [profileResult, greetingResult] = await Promise.allSettled([
          getCurrentUserProfile(),
          getCurrentUserGreeting(),
        ]);

        if (cancelled) {
          return;
        }

        if (profileResult.status === "fulfilled") {
          resetProfile({
            email: profileResult.value.email,
            sentimentAnalysis: profileResult.value.sentimentAnalysis,
          });
          setProfileName(profileResult.value.userName || "Writer");
        } else {
          setProfileName("Writer");
        }

        if (greetingResult.status === "fulfilled") {
          setGreeting(greetingResult.value.trim() || "Details ready.");
        } else {
          setGreeting("Details ready.");
        }

        if (profileResult.status === "rejected") {
          setBanner({
            tone: "error",
            message:
              isApiError(profileResult.reason)
                ? profileResult.reason.message
                : "Couldn't load this page.",
          });
        } else if (greetingResult.status === "rejected") {
          setBanner({
            tone: "error",
            message:
              isApiError(greetingResult.reason)
                ? greetingResult.reason.message
                : "Couldn't refresh the greeting right now.",
          });
        } else {
          setBanner(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfileData();

    return () => {
      cancelled = true;
    };
  }, [resetProfile]);

  useEffect(() => {
    async function refreshProfileOnFocus() {
      if (isDirty || isSubmitting || isUpdatingPassword) {
        return;
      }

      try {
        const nextProfile = await getCurrentUserProfile();
        resetProfile({
          email: nextProfile.email,
          sentimentAnalysis: nextProfile.sentimentAnalysis,
        });
        setProfileName(nextProfile.userName || "Writer");
      } catch {
        // Keep current form values when background refresh fails.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshProfileOnFocus();
      }
    }

    window.addEventListener("focus", refreshProfileOnFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshProfileOnFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDirty, isSubmitting, isUpdatingPassword, resetProfile]);

  useEffect(() => {
    if (!isDeleteDialogOpen || isDeleting) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDeleteDialogOpen(false);
        setDeleteDialogError(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteDialogOpen, isDeleting]);

  async function onSubmit(values: ProfileValues) {
    setBanner(null);

    try {
      const updatedProfile = await updateCurrentUser(values);
      resetProfile({
        email: updatedProfile.email,
        sentimentAnalysis: updatedProfile.sentimentAnalysis,
      });
      setProfileName(updatedProfile.userName || "Writer");
      setBanner({
        tone: "success",
        message: "Saved.",
      });
    } catch (error) {
      setBanner({
        tone: "error",
        message: isApiError(error) ? error.message : "Unable to save your changes.",
      });
    }
  }

  async function onPasswordSubmit(values: PasswordChangeValues) {
    setBanner(null);

    try {
      await updateCurrentUserPassword(values.newPassword);
      resetPassword({
        newPassword: "",
        confirmPassword: "",
      });
      setBanner({
        tone: "success",
        message: "Password changed.",
      });
    } catch (error) {
      setBanner({
        tone: "error",
        message:
          isApiError(error) ? error.message : "Unable to update your password.",
      });
    }
  }

  function handleOpenDeleteDialog() {
    setDeleteDialogError(null);
    setIsDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteDialogError(null);
    setIsDeleteDialogOpen(false);
  }

  async function handleDelete() {
    setBanner(null);
    setDeleteDialogError(null);
    setIsDeleting(true);

    try {
      await deleteCurrentUser();
      removeToken();
      router.replace("/signup");
    } catch (error) {
      const message =
        isApiError(error) ? error.message : "Unable to delete your account.";
      setDeleteDialogError(message);
      setBanner({
        tone: "error",
        message,
      });
      setIsDeleting(false);
    }
  }

  return (
    <section className="grid min-h-[calc(100svh-28px)] w-full bg-[var(--bg)] lg:grid-cols-[240px_auto] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b-[0.5px] border-[var(--line)] bg-[var(--bg)] px-5 py-5 max-lg:gap-5 lg:border-b-0 lg:border-r-[0.5px] lg:px-6 lg:py-6">
        <div className="grid gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
            Profile
          </p>
          <h1 className="text-[40px] font-medium leading-none text-[var(--text)] [font-family:var(--font-caveat),serif]">
            Account
          </h1>
          {isLoadingProfile ? (
            <div className="grid gap-2">
              <Skeleton className="h-5 w-full max-w-[10rem] rounded-full" />
              <Skeleton className="h-5 w-full max-w-[8rem] rounded-full" />
            </div>
          ) : (
            <p className="max-w-[18ch] text-[15px] leading-7 text-[var(--muted)]">
              Manage your account details and preferences.
            </p>
          )}
        </div>
        <div className="grid gap-2 border-t-[0.5px] border-[var(--line)] pt-5 lg:mt-auto">
          {isLoadingProfile ? (
            <>
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-10 w-full max-w-[10rem] rounded-full" />
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                {profileName}
              </p>
              <p className="text-[2rem] leading-[1.04] text-[var(--text-strong)] [font-family:var(--font-caveat),serif]">
                {greeting}
              </p>
            </>
          )}
        </div>
      </aside>

      <main className="min-h-0 min-w-0 bg-[var(--bg)]">
        <div className="flex h-full min-h-0 items-start justify-center overflow-auto p-4 lg:justify-start lg:p-0">
          <article className="flex min-h-[460px] w-full max-w-[720px] min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] sm:min-h-[560px] lg:h-full lg:w-auto lg:max-w-full lg:rounded-none lg:aspect-[297/420]">
            <header className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8 sm:py-7">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                Profile
              </p>
              <h2 className="mt-4 text-[30px] font-medium leading-none text-[var(--text)] [font-family:var(--font-caveat),serif] sm:text-[36px]">
                Account details
              </h2>
              <p className="mt-4 max-w-[30ch] text-[15px] leading-7 text-[var(--muted)]">
                Update the details tied to this notebook.
              </p>
            </header>

            {banner && !isLoadingProfile ? (
              <div className="border-b-[0.5px] border-[var(--line)] px-6 py-4 text-[0.92rem] leading-6 text-[var(--danger)] sm:px-8">
                {banner.message}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto">
              <section className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8">
                <div className="grid gap-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                    Edit
                  </p>
                  <h3 className="text-[1.32rem] font-medium leading-[1.25] text-[var(--text-strong)]">
                    Basic info
                  </h3>
                  <p className="text-[15px] leading-7 text-[var(--muted)]">
                    Keep your email and preferences current.
                  </p>
                </div>

                {isLoadingProfile ? (
                  <div className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                      <Skeleton className="h-3 w-12 rounded-full" />
                      <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
                      <Skeleton className="h-4 w-full max-w-[12rem] rounded-full" />
                    </div>

                    <div className="rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="mt-0.5 size-[18px] rounded-[6px]" />
                        <div className="grid flex-1 gap-2">
                          <Skeleton className="h-3 w-24 rounded-full" />
                          <Skeleton className="h-4 w-full max-w-[14rem] rounded-full" />
                        </div>
                      </div>
                    </div>

                    <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
                  </div>
                ) : (
                  <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit(onSubmit)}>
                    <FormField
                      label="Email"
                      htmlFor="profile-email"
                      hint="Use the address tied to this account."
                      error={errors.email?.message}
                    >
                      <input
                        {...registerProfile("email")}
                        id="profile-email"
                        className={inputClass}
                        type="email"
                        autoComplete="email"
                        placeholder="writer@example.com"
                      />
                    </FormField>

                    <CheckboxField
                      label="Mood labels"
                      description="Let the app sort entries by sentiment."
                      error={errors.sentimentAnalysis?.message}
                    >
                      <input
                        {...registerProfile("sentimentAnalysis")}
                        className="mt-0.5 size-[18px] accent-[var(--text)]"
                        type="checkbox"
                      />
                    </CheckboxField>

                    <button className={primaryButtonClass} type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                )}
              </section>

              <section className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                  Security
                </p>
                <h3 className="mt-4 text-[1.32rem] font-medium leading-[1.25] text-[var(--text-strong)]">
                  Change password
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
                  Choose a new password for this account.
                </p>

                {isLoadingProfile ? (
                  <div className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
                    </div>
                    <div className="grid gap-2">
                      <Skeleton className="h-3 w-28 rounded-full" />
                      <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
                    </div>
                    <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
                  </div>
                ) : (
                  <form className="mt-6 grid gap-4" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                    <FormField
                      label="New password"
                      htmlFor="profile-new-password"
                      error={passwordErrors.newPassword?.message}
                    >
                      <input
                        {...registerPassword("newPassword")}
                        id="profile-new-password"
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        placeholder="New password"
                      />
                    </FormField>

                    <FormField
                      label="Confirm password"
                      htmlFor="profile-confirm-password"
                      error={passwordErrors.confirmPassword?.message}
                    >
                      <input
                        {...registerPassword("confirmPassword")}
                        id="profile-confirm-password"
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                      />
                    </FormField>

                    <button
                      className={primaryButtonClass}
                      type="submit"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Updating..." : "Change password"}
                    </button>
                  </form>
                )}
              </section>

              <section className="px-6 py-6 sm:px-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                  Danger
                </p>
                <h3 className="mt-4 text-[1.32rem] font-medium leading-[1.25] text-[var(--text-strong)]">
                  Delete account
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
                  Remove this account and its stored journal entries.
                </p>
                {isLoadingProfile ? (
                  <Skeleton className="mt-6 min-h-[52px] w-full rounded-[16px]" />
                ) : (
                  <button
                    className={`mt-6 w-full ${dangerButtonClass}`}
                    type="button"
                    onClick={handleOpenDeleteDialog}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete account"}
                  </button>
                )}
              </section>
            </div>
          </article>
        </div>
      </main>
      {isDeleteDialogOpen ? (
        <div
          aria-modal="true"
          aria-labelledby="profile-delete-account-title"
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          style={{
            backgroundColor: "rgba(44, 42, 39, 0.14)",
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDeleteDialog();
            }
          }}
        >
          <div className="w-full max-w-[400px] rounded-[24px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex size-10 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text)]">
                <Trash2 className="size-4" strokeWidth={1.7} />
              </div>
              <button
                aria-label="Close delete account dialog"
                className="inline-flex size-8 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:opacity-50"
                type="button"
                onClick={handleCloseDeleteDialog}
                disabled={isDeleting}
              >
                <X className="size-3.5" strokeWidth={1.7} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                Delete account
              </p>
              <div className="space-y-2">
                <h2
                  className="text-[30px] font-medium leading-[1.05] text-[var(--text)] [font-family:var(--font-lora),serif]"
                  id="profile-delete-account-title"
                >
                  Remove this account?
                </h2>
                <p className="max-w-[30ch] text-[14px] leading-6 text-[var(--muted)]">
                  This will permanently delete your account and all stored journal
                  entries.
                </p>
              </div>
            </div>

            {deleteDialogError ? (
              <p className="mt-4 rounded-[14px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-[12px] text-[var(--text)]">
                {deleteDialogError}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="inline-flex h-10 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] px-4 text-[12px] uppercase tracking-[0.2em] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:opacity-50"
                type="button"
                onClick={handleCloseDeleteDialog}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--button-primary-bg)] px-4 text-[12px] uppercase tracking-[0.2em] text-[var(--button-primary-text)] transition hover:bg-[var(--button-primary-hover)] disabled:opacity-50"
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
