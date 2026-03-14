import { Skeleton } from "../ui/Skeleton";

type AuthFormSkeletonProps = {
  mode: "login" | "signup";
};

export function AuthFormSkeleton({ mode }: AuthFormSkeletonProps) {
  const isSignup = mode === "signup";

  return (
    <section className="grid gap-6">
      <div className="grid gap-3">
        <Skeleton className="h-12 w-48 rounded-full sm:w-56" />
        <Skeleton className="h-5 w-full max-w-[18rem] rounded-full" />
        <Skeleton className="h-5 w-full max-w-[14rem] rounded-full" />
      </div>

      <div className="grid gap-4 rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] px-5 py-5">
        <div className="grid gap-2">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
        </div>

        {isSignup ? (
          <div className="grid gap-2">
            <Skeleton className="h-3 w-14 rounded-full" />
            <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
          </div>
        ) : null}

        <div className="grid gap-2">
          <Skeleton className="h-3 w-[4.5rem] rounded-full" />
          <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
        </div>

        {isSignup ? (
          <div className="rounded-[16px] border-[0.5px] border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4">
            <div className="flex items-start gap-3">
              <Skeleton className="mt-0.5 size-[18px] rounded-[6px]" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-4 w-full max-w-[14rem] rounded-full" />
              </div>
            </div>
          </div>
        ) : null}

        <Skeleton className="min-h-[52px] w-full rounded-[16px]" />
      </div>

      <Skeleton className="h-5 w-full max-w-[12rem] rounded-full" />
    </section>
  );
}
