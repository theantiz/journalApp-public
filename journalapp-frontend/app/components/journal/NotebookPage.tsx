import type { RefObject } from "react";
import { Cloud, Flame, Frown, Smile } from "lucide-react";
import type { JournalEntry, SentimentOption } from "./journal-data";
import {
  countWords,
  formatFullDate,
  formatMetaLine,
  formatSentimentLabel,
} from "./journal-utils";
import { Skeleton } from "../ui/Skeleton";

type NotebookPageProps = {
  activeEntry: JournalEntry | null;
  isLoading: boolean;
  pageNumber: number;
  sentimentOptions: readonly SentimentOption[];
  statusMessage: string | null;
  titleRef: RefObject<HTMLInputElement | null>;
  onTitleInput: (nextValue: string) => void;
  onBodyInput: (nextValue: string) => void;
  onSelectSentiment: (sentiment: SentimentOption) => void;
};

const EDITOR_LINE_HEIGHT = 34;
const EDITOR_TOP_PADDING = 20;

function MoodIcon({ sentiment }: { sentiment: SentimentOption }) {
  if (sentiment === "HAPPY") {
    return <Smile className="size-3.5" strokeWidth={1.7} />;
  }

  if (sentiment === "SAD") {
    return <Frown className="size-3.5" strokeWidth={1.7} />;
  }

  if (sentiment === "ANGRY") {
    return <Flame className="size-3.5" strokeWidth={1.7} />;
  }

  return <Cloud className="size-3.5" strokeWidth={1.7} />;
}

export function NotebookPage({
  activeEntry,
  isLoading,
  pageNumber,
  sentimentOptions,
  statusMessage,
  titleRef,
  onTitleInput,
  onBodyInput,
  onSelectSentiment,
}: NotebookPageProps) {
  const currentTitle = activeEntry?.title ?? "";
  const currentContent = activeEntry?.content ?? "";
  const currentDate = activeEntry?.entryDate ?? null;
  const currentSentiment = activeEntry?.sentiment ?? null;
  const isEditable = activeEntry !== null;
  const showSkeleton = isLoading && !activeEntry;

  return (
    <main className="min-h-0 min-w-0 bg-[var(--bg)]">
      <div className="scrollbar-gutter-stable flex h-full min-h-0 items-start justify-center overflow-auto p-4 lg:justify-start lg:p-0">
        <article className="flex min-h-[460px] w-full max-w-[720px] min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] sm:min-h-[560px] lg:h-full lg:w-auto lg:max-w-full lg:rounded-none lg:aspect-[297/420]">
          <header className="border-b-[0.5px] border-[var(--line)] px-6 py-6 sm:px-8 sm:py-7">
            {showSkeleton ? (
              <>
                <Skeleton className="h-3 w-40 rounded-full" />
                <Skeleton className="mt-4 h-12 w-full max-w-[16rem] rounded-full" />
                <div className="mt-5 flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={`sentiment-skeleton-${index}`}
                      className="h-8 w-[5.5rem] rounded-full"
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                  {formatMetaLine(currentDate)}
                </p>
                <input
                  ref={titleRef}
                  aria-label="Entry title"
                  className="mt-4 w-full border-0 bg-transparent p-0 text-[30px] font-medium leading-none text-[var(--text)] outline-none placeholder:text-[var(--muted)] [font-family:var(--font-caveat),serif] sm:text-[36px]"
                  placeholder={activeEntry ? "Untitled" : ""}
                  value={currentTitle}
                  onChange={(event) => onTitleInput(event.target.value)}
                  readOnly={!isEditable}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {sentimentOptions.map((sentiment) => {
                    const isActive = currentSentiment === sentiment;

                    return (
                      <button
                        key={sentiment}
                        className={`inline-flex min-h-8 items-center gap-2 rounded-full border-[0.5px] px-3 py-1.5 text-[11px] font-normal leading-none text-[var(--text)] transition sm:text-[12px] ${
                          isActive
                            ? "border-[var(--line)] bg-[var(--surface-muted)]"
                            : "border-[var(--line)] bg-transparent hover:bg-[var(--surface-soft)]"
                        } disabled:opacity-40`}
                        type="button"
                        onClick={() => onSelectSentiment(sentiment)}
                        disabled={!isEditable}
                      >
                        <MoodIcon sentiment={sentiment} />
                        {formatSentimentLabel(sentiment)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
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
            {showSkeleton ? (
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
            ) : (
              <textarea
                aria-label="Journal entry body"
                className="scrollbar-gutter-stable relative z-[1] h-full w-full resize-none overflow-y-scroll border-0 bg-transparent px-6 pb-5 pt-5 text-[15px] font-normal text-[var(--text)] outline-none placeholder:text-[var(--muted)] [font-family:var(--font-lora),serif] sm:px-8 sm:text-[16px]"
                placeholder={isLoading || !activeEntry ? "" : "Write..."}
                value={currentContent}
                onChange={(event) => onBodyInput(event.target.value)}
                readOnly={!isEditable}
                spellCheck={false}
                style={{
                  lineHeight: `${EDITOR_LINE_HEIGHT}px`,
                  paddingTop: `${EDITOR_TOP_PADDING}px`,
                }}
              />
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t-[0.5px] border-[var(--line)] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace] sm:px-8">
            {showSkeleton ? (
              <>
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full max-sm:w-full" />
                <Skeleton className="ml-auto h-3 w-10 rounded-full" />
              </>
            ) : (
              <>
                <span>{countWords(currentContent)} words</span>
                <span className="max-sm:w-full max-sm:text-left sm:text-center">
                  {formatFullDate(currentDate)}
                </span>
                <span className="ml-auto">{String(pageNumber).padStart(2, "0")}</span>
              </>
            )}
          </footer>

          <div className="sr-only" aria-live="polite">
            {statusMessage || (isLoading ? "Loading entry" : "")}
          </div>
        </article>
      </div>
    </main>
  );
}
