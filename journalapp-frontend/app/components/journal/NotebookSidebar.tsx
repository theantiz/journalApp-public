import { memo } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import type { JournalEntry } from "./journal-data";
import { formatEntryDate } from "./journal-utils";
import { Tooltip } from "../ui/Tooltip";
import { Skeleton } from "../ui/Skeleton";

type NotebookSidebarProps = {
  entries: JournalEntry[];
  activeEntryId: string | null;
  deletingEntryId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  onCreateEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  onSelectEntry: (entryId: string) => void;
};

function NotebookSidebarComponent({
  entries,
  activeEntryId,
  deletingEntryId,
  isCreating,
  isLoading,
  onCreateEntry,
  onDeleteEntry,
  onSelectEntry,
}: NotebookSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-[var(--line)] bg-[var(--bg)] max-lg:border-b-[0.5px] lg:border-r-[0.5px]">
      <div className="flex items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="text-[40px] font-medium leading-none text-[var(--text)] [font-family:var(--font-caveat),serif]">
          2026
        </h1>
        <Tooltip label="New entry" align="end">
          <button
            aria-label="New entry"
            className="group inline-flex size-8 items-center justify-center rounded-full text-[var(--text)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
            type="button"
            onClick={onCreateEntry}
            disabled={isCreating || isLoading}
          >
            <Plus className="size-4" strokeWidth={1.7} />
          </button>
        </Tooltip>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto px-3 pb-4 lg:px-2 lg:pb-3"
        role="list"
        aria-label="Diary entries"
      >
        <div className="flex gap-2 lg:block lg:space-y-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`journal-entry-skeleton-${index}`}
                  className="min-w-0 flex-none rounded-[12px] px-4 py-3 lg:flex-auto"
                >
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="mt-3 h-6 w-full max-w-[8.5rem] rounded-full" />
                </div>
              ))
            : entries.map((entry) => {
                const isActive = entry.clientKey === activeEntryId;
                const isDeleting = deletingEntryId === entry.clientKey;

                return (
                  <div
                    key={entry.clientKey}
                    className="group relative min-w-0 flex-none lg:flex-auto"
                  >
                    <button
                      className={`block w-[220px] max-w-[72vw] rounded-[12px] px-4 py-3 pr-12 text-left transition lg:w-full lg:max-w-none ${
                        isActive
                          ? "bg-[var(--surface-muted)]"
                          : "hover:bg-[var(--surface-soft)]"
                      }`}
                      type="button"
                      onClick={() => onSelectEntry(entry.clientKey)}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                        {formatEntryDate(entry.entryDate)}
                      </p>
                      <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-medium leading-[1.3] text-[var(--text)] [font-family:var(--font-lora),serif]">
                        {entry.title.trim() || "Untitled"}
                      </p>
                    </button>

                    <Tooltip
                      label="Delete entry"
                      align="end"
                      className="absolute right-3 top-3"
                    >
                      <button
                        aria-label={`Delete ${entry.title.trim() || "entry"}`}
                        className={`inline-flex size-7 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-solid)] hover:text-[var(--text)] ${
                          isDeleting
                            ? "opacity-100"
                            : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                        }`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteEntry(entry.clientKey);
                        }}
                      >
                        {isDeleting ? (
                          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={1.7} />
                        ) : (
                          <Trash2 className="size-3.5" strokeWidth={1.7} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                );
              })}
        </div>
      </div>
    </aside>
  );
}

function entriesAffectSidebar(
  currentEntries: JournalEntry[],
  nextEntries: JournalEntry[]
) {
  if (currentEntries.length !== nextEntries.length) {
    return true;
  }

  return currentEntries.some((entry, index) => {
    const nextEntry = nextEntries[index];

    return (
      entry.clientKey !== nextEntry.clientKey ||
      entry.title !== nextEntry.title ||
      entry.entryDate !== nextEntry.entryDate
    );
  });
}

export const NotebookSidebar = memo(
  NotebookSidebarComponent,
  (prevProps, nextProps) =>
    prevProps.activeEntryId === nextProps.activeEntryId &&
    prevProps.deletingEntryId === nextProps.deletingEntryId &&
    prevProps.isCreating === nextProps.isCreating &&
    prevProps.isLoading === nextProps.isLoading &&
    !entriesAffectSidebar(prevProps.entries, nextProps.entries)
);
