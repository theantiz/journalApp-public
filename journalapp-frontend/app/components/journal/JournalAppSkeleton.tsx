import { Skeleton } from "../ui/Skeleton";

const EDITOR_LINE_HEIGHT = 34;
const EDITOR_TOP_PADDING = 20;

export function JournalAppSkeleton() {
  return (
    <div className="journal-app min-h-screen min-h-[100svh] bg-[var(--bg)] px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5">
      <div className="mx-auto w-full lg:w-fit lg:max-w-[calc(100vw-40px)]">
        <div className="flex w-full flex-wrap items-center justify-end gap-2 pb-2">
          <Skeleton className="size-8 rounded-full border-[0.5px] border-[var(--line)]" />
          <Skeleton className="size-8 rounded-full border-[0.5px] border-[var(--line)]" />
          <Skeleton className="size-8 rounded-full border-[0.5px] border-[var(--line)]" />
        </div>

        <div className="grid min-h-[calc(100svh-28px)] w-full overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] lg:w-fit lg:max-w-[calc(100vw-40px)] lg:grid-cols-[240px_auto] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-[var(--line)] bg-[var(--bg)] max-lg:border-b-[0.5px] lg:border-r-[0.5px]">
            <div className="flex items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
              <Skeleton className="h-12 w-28 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 lg:px-2 lg:pb-3">
              <div className="flex gap-2 lg:block lg:space-y-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`journal-entry-skeleton-${index}`}
                    className="w-[220px] max-w-[72vw] rounded-[12px] px-4 py-3 lg:w-full lg:max-w-none"
                  >
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="mt-3 h-6 w-full max-w-[8.5rem] rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-h-0 min-w-0 bg-[var(--bg)]">
            <div className="flex h-full min-h-0 items-start justify-center overflow-auto p-4 lg:justify-start lg:p-0">
              <article className="flex min-h-[460px] w-full max-w-[720px] min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] sm:min-h-[560px] lg:h-full lg:w-auto lg:max-w-full lg:rounded-none lg:aspect-[297/420]">
                <header className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8 sm:py-7">
                  <Skeleton className="h-3 w-40 rounded-full" />
                  <Skeleton className="mt-4 h-12 w-full max-w-[16rem] rounded-full" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={`journal-pill-skeleton-${index}`}
                        className="h-8 w-[5.5rem] rounded-full"
                      />
                    ))}
                  </div>
                </header>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, transparent ${EDITOR_LINE_HEIGHT - 1}px, var(--editor-rule) ${EDITOR_LINE_HEIGHT - 1}px, var(--editor-rule) ${EDITOR_LINE_HEIGHT}px)`,
                      backgroundPosition: `0 ${EDITOR_TOP_PADDING}px`,
                      backgroundRepeat: "repeat-y",
                      backgroundSize: `100% ${EDITOR_LINE_HEIGHT}px`,
                    }}
                  />
                  <div className="relative z-[1] px-6 pb-5 sm:px-8">
                    <div
                      className="grid gap-3"
                      style={{ paddingTop: `${EDITOR_TOP_PADDING}px` }}
                    >
                      <Skeleton className="h-6 w-full max-w-[16rem] rounded-full" />
                      <Skeleton className="h-6 w-full max-w-[20rem] rounded-full" />
                      <Skeleton className="h-6 w-full max-w-[12rem] rounded-full" />
                    </div>
                  </div>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t-[0.5px] border-[var(--line)] px-6 py-3 sm:px-8">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-3 w-10 rounded-full" />
                </footer>
              </article>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
