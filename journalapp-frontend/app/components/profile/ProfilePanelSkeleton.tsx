import { Skeleton } from "../ui/Skeleton";

export function ProfilePanelSkeleton() {
  return (
    <section className="grid min-h-[calc(100svh-28px)] w-full bg-[var(--bg)] lg:grid-cols-[240px_auto] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b-[0.5px] border-[var(--line)] bg-[var(--bg)] px-5 py-5 max-lg:gap-5 lg:border-b-0 lg:border-r-[0.5px] lg:px-6 lg:py-6">
        <div className="grid gap-3">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-12 w-28 rounded-full" />
          <Skeleton className="h-5 w-full max-w-[10rem] rounded-full" />
          <Skeleton className="h-5 w-full max-w-[8rem] rounded-full" />
        </div>
        <div className="grid gap-2 border-t-[0.5px] border-[var(--line)] pt-5 lg:mt-auto">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-10 w-full max-w-[10rem] rounded-full" />
        </div>
      </aside>

      <main className="min-h-0 min-w-0 bg-[var(--bg)]">
        <div className="flex h-full min-h-0 items-start justify-center overflow-auto p-4 lg:justify-start lg:p-0">
          <article className="flex min-h-[460px] w-full max-w-[720px] min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] sm:min-h-[560px] lg:h-full lg:w-auto lg:max-w-full lg:rounded-none lg:aspect-[297/420]">
            <header className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8 sm:py-7">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="mt-4 h-12 w-full max-w-[18rem] rounded-full" />
              <Skeleton className="mt-4 h-5 w-full max-w-[16rem] rounded-full" />
              <Skeleton className="mt-2 h-5 w-full max-w-[10rem] rounded-full" />
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <section className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8">
                <div className="grid gap-2">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="h-8 w-full max-w-[10rem] rounded-full" />
                  <Skeleton className="h-5 w-full max-w-[16rem] rounded-full" />
                </div>

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
              </section>

              <section className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="mt-4 h-8 w-full max-w-[12rem] rounded-full" />
                <Skeleton className="mt-4 h-5 w-full max-w-[14rem] rounded-full" />
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
              </section>

              <section className="px-6 py-6 sm:px-8">
                <Skeleton className="h-3 w-14 rounded-full" />
                <Skeleton className="mt-4 h-8 w-full max-w-[12rem] rounded-full" />
                <Skeleton className="mt-4 h-5 w-full max-w-[16rem] rounded-full" />
                <Skeleton className="mt-6 min-h-[52px] w-full rounded-[16px]" />
              </section>
            </div>
          </article>
        </div>
      </main>
    </section>
  );
}
