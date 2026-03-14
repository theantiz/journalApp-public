"use client";

import Link from "next/link";
import { startTransition, useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import { LogOut, Moon, SunMedium, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SENTIMENT_OPTIONS,
  type JournalEntry,
  type SentimentOption,
} from "./journal-data";
import { NotebookPage } from "./NotebookPage";
import { NotebookSidebar } from "./NotebookSidebar";
import { getPlainTextContent, placeCaretAtEnd } from "./journal-utils";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  getJournalSentiments,
  updateJournalEntry,
} from "@/lib/journal-api";
import { isApiError } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { toggleTheme, useTheme } from "@/lib/theme";
import { APP_THEME_DARK, APP_THEME_LIGHT } from "../layout/app-shell-theme";
import { Tooltip } from "../ui/Tooltip";

type LoadState = "loading" | "ready" | "error";
type PendingSave = {
  entry: JournalEntry;
  version: number;
};

type JournalState = {
  entries: JournalEntry[];
  activeEntryId: string;
};

type JournalAction =
  | { type: "replaceEntries"; entries: JournalEntry[] }
  | { type: "selectEntry"; entryId: string };

function updateEntryList(
  entries: JournalEntry[],
  entryId: string,
  updater: (entry: JournalEntry) => JournalEntry
) {
  return entries.map((entry) =>
    entry.clientKey === entryId ? updater(entry) : entry
  );
}

function buildJournalState(
  entries: JournalEntry[],
  activeEntryId = entries[0]?.clientKey ?? ""
): JournalState {
  if (entries.some((entry) => entry.clientKey === activeEntryId)) {
    return {
      entries,
      activeEntryId,
    };
  }

  return {
    entries,
    activeEntryId: entries[0]?.clientKey ?? "",
  };
}

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case "replaceEntries":
      return buildJournalState(action.entries, state.activeEntryId);
    case "selectEntry":
      return {
        ...state,
        activeEntryId: action.entryId,
      };
    default:
      return state;
  }
}

function getDirtyEntryIds(
  currentEntries: JournalEntry[],
  pendingSaves: Map<string, PendingSave>,
  inFlightSaveVersions: Map<string, Set<number>>
) {
  const dirtyEntryIds = new Set<string>();
  const currentEntriesByClientKey = new Map(
    currentEntries.map((entry) => [entry.clientKey, entry])
  );

  for (const pendingSave of pendingSaves.values()) {
    if (pendingSave.entry.id) {
      dirtyEntryIds.add(pendingSave.entry.id);
    }
  }

  for (const [clientKey, versions] of inFlightSaveVersions.entries()) {
    if (versions.size === 0) {
      continue;
    }

    const currentEntry = currentEntriesByClientKey.get(clientKey);
    if (currentEntry?.id) {
      dirtyEntryIds.add(currentEntry.id);
    }
  }

  return dirtyEntryIds;
}

function mergeServerEntries(
  serverEntries: JournalEntry[],
  currentEntries: JournalEntry[],
  dirtyEntryIds: Set<string>
) {
  const currentEntriesById = new Map<string, JournalEntry>();

  for (const currentEntry of currentEntries) {
    if (currentEntry.id) {
      currentEntriesById.set(currentEntry.id, currentEntry);
    }
  }

  return serverEntries.map((serverEntry) => {
    if (!serverEntry.id) {
      return serverEntry;
    }

    const currentEntry = currentEntriesById.get(serverEntry.id);
    if (!currentEntry) {
      return serverEntry;
    }

    if (dirtyEntryIds.has(serverEntry.id)) {
      return currentEntry;
    }

    return {
      ...serverEntry,
      clientKey: currentEntry.clientKey,
    };
  });
}

export function JournalApp() {
  const router = useRouter();
  const theme = useTheme();
  const [journalState, dispatch] = useReducer(
    journalReducer,
    [],
    (entries) => buildJournalState(entries)
  );
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sentimentOptions, setSentimentOptions] = useState<SentimentOption[]>(
    DEFAULT_SENTIMENT_OPTIONS
  );
  const [isCreating, setIsCreating] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<JournalEntry | null>(
    null
  );
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);

  const entriesRef = useRef(journalState.entries);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutsRef = useRef(new Map<string, number>());
  const pendingSavesRef = useRef(new Map<string, PendingSave>());
  const inFlightSaveVersionsRef = useRef(new Map<string, Set<number>>());
  const latestSaveVersionRef = useRef(new Map<string, number>());
  const shouldFocusTitleRef = useRef(false);

  const { entries, activeEntryId } = journalState;
  const activeEntry =
    entries.find((entry) => entry.clientKey === activeEntryId) ?? entries[0] ?? null;
  const activeEntryIndex = Math.max(
    entries.findIndex((entry) => entry.clientKey === activeEntryId),
    0
  );
  const pageNumber = entries.length === 0 ? 1 : activeEntryIndex + 1;
  const journalTheme = theme === "dark" ? APP_THEME_DARK : APP_THEME_LIGHT;
  const nextThemeLabel = theme === "dark" ? "light" : "dark";
  const utilityButtonClass =
    "inline-flex size-8 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] bg-[var(--surface-solid)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]";

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const refreshEntries = useEffectEvent(async (mode: "initial" | "background" = "background") => {
    try {
      const serverEntries = await getJournalEntries();
      const dirtyEntryIds = getDirtyEntryIds(
        entriesRef.current,
        pendingSavesRef.current,
        inFlightSaveVersionsRef.current
      );
      const mergedEntries = mergeServerEntries(
        serverEntries,
        entriesRef.current,
        dirtyEntryIds
      );

      replaceEntries(mergedEntries);
      setLoadState("ready");

      if (mode === "initial") {
        setStatusMessage(null);
      }
    } catch (error) {
      if (mode === "initial") {
        setLoadState("error");
        setStatusMessage(
          isApiError(error) ? error.message : "Unable to load entries."
        );
      }
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      await refreshEntries("initial");

      if (cancelled) {
        return;
      }
    }

    async function loadSentiments() {
      try {
        const nextOptions = await getJournalSentiments();

        if (!cancelled && nextOptions.length > 0) {
          setSentimentOptions(nextOptions as SentimentOption[]);
        }
      } catch {
        if (!cancelled) {
          setSentimentOptions(DEFAULT_SENTIMENT_OPTIONS);
        }
      }
    }

    void loadEntries();
    void loadSentiments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saveTimeouts = saveTimeoutsRef.current;
    const pendingSaves = pendingSavesRef.current;

    return () => {
      const queuedSaves = Array.from(pendingSaves.values());

      for (const timeoutId of saveTimeouts.values()) {
        window.clearTimeout(timeoutId);
      }

      saveTimeouts.clear();
      pendingSaves.clear();

      for (const pendingSave of queuedSaves) {
        if (pendingSave.entry.id) {
          void updateJournalEntry(
            pendingSave.entry.id,
            {
              title: pendingSave.entry.title,
              content: pendingSave.entry.content,
              sentiment: pendingSave.entry.sentiment,
            },
            { keepalive: true }
          );
        }
      }
    };
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      const pendingSaves = Array.from(pendingSavesRef.current.values());

      for (const timeoutId of saveTimeoutsRef.current.values()) {
        window.clearTimeout(timeoutId);
      }

      saveTimeoutsRef.current.clear();
      pendingSavesRef.current.clear();

      for (const pendingSave of pendingSaves) {
        if (pendingSave.entry.id) {
          void updateJournalEntry(
            pendingSave.entry.id,
            {
              title: pendingSave.entry.title,
              content: pendingSave.entry.content,
              sentiment: pendingSave.entry.sentiment,
            },
            { keepalive: true }
          );
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshEntries();
      }
    }, 12000);

    function handleWindowFocus() {
      void refreshEntries();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshEntries();
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!shouldFocusTitleRef.current) {
      return;
    }

    placeCaretAtEnd(titleRef.current);
    shouldFocusTitleRef.current = false;
  }, [activeEntryId]);

  useEffect(() => {
    if (!entryPendingDelete) {
      return;
    }

    const nextPendingEntry =
      entries.find((entry) => entry.clientKey === entryPendingDelete.clientKey) ?? null;

    if (!nextPendingEntry) {
      setEntryPendingDelete(null);
      setDeleteDialogError(null);
    }
  }, [entries, entryPendingDelete]);

  useEffect(() => {
    if (!entryPendingDelete || deletingEntryId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEntryPendingDelete(null);
        setDeleteDialogError(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deletingEntryId, entryPendingDelete]);

  function replaceEntries(nextEntries: JournalEntry[]) {
    entriesRef.current = nextEntries;
    dispatch({ type: "replaceEntries", entries: nextEntries });
  }

  function clearEntrySaveQueue(entryId: string) {
    const queuedTimeout = saveTimeoutsRef.current.get(entryId);

    if (queuedTimeout) {
      window.clearTimeout(queuedTimeout);
      saveTimeoutsRef.current.delete(entryId);
    }

    pendingSavesRef.current.delete(entryId);
    inFlightSaveVersionsRef.current.delete(entryId);
    latestSaveVersionRef.current.delete(entryId);
  }

  function markEntrySaveInFlight(entryId: string, version: number) {
    const versions = inFlightSaveVersionsRef.current.get(entryId) ?? new Set<number>();
    versions.add(version);
    inFlightSaveVersionsRef.current.set(entryId, versions);
  }

  function clearEntrySaveInFlight(entryId: string, version: number) {
    const versions = inFlightSaveVersionsRef.current.get(entryId);

    if (!versions) {
      return;
    }

    versions.delete(version);

    if (versions.size === 0) {
      inFlightSaveVersionsRef.current.delete(entryId);
    }
  }

  async function persistEntry(
    entryToSave: JournalEntry,
    version: number,
    options: Pick<RequestInit, "keepalive"> = {}
  ) {
    if (!entryToSave.id) {
      return;
    }

    markEntrySaveInFlight(entryToSave.clientKey, version);

    try {
      const savedEntry = await updateJournalEntry(
        entryToSave.id,
        {
          title: entryToSave.title,
          content: entryToSave.content,
          sentiment: entryToSave.sentiment,
        },
        options
      );

      const isLatestVersion =
        latestSaveVersionRef.current.get(entryToSave.clientKey) === version &&
        !pendingSavesRef.current.has(entryToSave.clientKey);

      if (isLatestVersion) {
        replaceEntries(
          entriesRef.current.map((entry) =>
            entry.clientKey === entryToSave.clientKey ? savedEntry : entry
          )
        );
      }

      setStatusMessage(null);
    } catch (error) {
      const isLatestVersion =
        latestSaveVersionRef.current.get(entryToSave.clientKey) === version;

      if (isLatestVersion) {
        setStatusMessage(
          isApiError(error) ? error.message : "Unable to save changes."
        );
      }
    } finally {
      clearEntrySaveInFlight(entryToSave.clientKey, version);
    }
  }

  function queueSave(nextEntry: JournalEntry) {
    if (!nextEntry.id) {
      return;
    }

    const nextVersion = (latestSaveVersionRef.current.get(nextEntry.clientKey) ?? 0) + 1;
    latestSaveVersionRef.current.set(nextEntry.clientKey, nextVersion);
    pendingSavesRef.current.set(nextEntry.clientKey, {
      entry: nextEntry,
      version: nextVersion,
    });

    const existingTimeout = saveTimeoutsRef.current.get(nextEntry.clientKey);

    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      saveTimeoutsRef.current.delete(nextEntry.clientKey);

      const pendingSave = pendingSavesRef.current.get(nextEntry.clientKey);

      if (!pendingSave) {
        return;
      }

      pendingSavesRef.current.delete(nextEntry.clientKey);
      void persistEntry(pendingSave.entry, pendingSave.version);
    }, 650);

    saveTimeoutsRef.current.set(nextEntry.clientKey, timeoutId);
  }

  function commitEntry(
    entryId: string,
    updater: (entry: JournalEntry) => JournalEntry
  ) {
    const nextEntries = updateEntryList(entriesRef.current, entryId, updater);
    const nextEntry =
      nextEntries.find((entry) => entry.clientKey === entryId) ?? null;

    replaceEntries(nextEntries);

    if (nextEntry) {
      queueSave(nextEntry);
    }
  }

  function handleTitleInput(nextTitle: string) {
    if (!activeEntry) {
      return;
    }

    const normalizedTitle = getPlainTextContent(nextTitle);

    commitEntry(activeEntry.clientKey, (entry) => ({
      ...entry,
      title: normalizedTitle,
    }));
  }

  function handleBodyInput(nextBody: string) {
    if (!activeEntry) {
      return;
    }

    const normalizedBody = getPlainTextContent(nextBody);

    commitEntry(activeEntry.clientKey, (entry) => ({
      ...entry,
      content: normalizedBody,
    }));
  }

  function handleSelectSentiment(sentiment: SentimentOption) {
    if (!activeEntry) {
      return;
    }

    commitEntry(activeEntry.clientKey, (entry) => ({
      ...entry,
      sentiment: entry.sentiment === sentiment ? null : sentiment,
    }));
  }

  async function handleCreateEntry() {
    setIsCreating(true);
    setStatusMessage(null);

    try {
      const nextEntry = await createJournalEntry({
        title: "",
        content: "",
      });

      shouldFocusTitleRef.current = true;
      replaceEntries([nextEntry, ...entriesRef.current]);

      startTransition(() => {
        dispatch({ type: "selectEntry", entryId: nextEntry.clientKey });
      });
    } catch (error) {
      setStatusMessage(
        isApiError(error) ? error.message : "Unable to create entry."
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleSelectEntry(entryId: string) {
    startTransition(() => {
      dispatch({ type: "selectEntry", entryId });
    });
  }

  function handleRequestDeleteEntry(entryId: string) {
    const entryToDelete =
      entriesRef.current.find((entry) => entry.clientKey === entryId) ?? null;

    if (!entryToDelete || deletingEntryId === entryId) {
      return;
    }

    setEntryPendingDelete(entryToDelete);
    setDeleteDialogError(null);
  }

  function handleCloseDeleteDialog() {
    if (deletingEntryId) {
      return;
    }

    setEntryPendingDelete(null);
    setDeleteDialogError(null);
  }

  async function handleConfirmDeleteEntry() {
    if (!entryPendingDelete) {
      return;
    }

    const entryId = entryPendingDelete.clientKey;
    const entryToDelete =
      entriesRef.current.find((entry) => entry.clientKey === entryId) ?? null;

    if (!entryToDelete) {
      setEntryPendingDelete(null);
      setDeleteDialogError(null);
      return;
    }

    setDeletingEntryId(entryId);
    setStatusMessage(null);
    setDeleteDialogError(null);
    clearEntrySaveQueue(entryId);

    try {
      if (entryToDelete.id) {
        await deleteJournalEntry(entryToDelete.id);
      }

      replaceEntries(
        entriesRef.current.filter((entry) => entry.clientKey !== entryId)
      );
      setEntryPendingDelete(null);
    } catch (error) {
      const message =
        isApiError(error) ? error.message : "Unable to delete entry.";
      setStatusMessage(
        message
      );
      setDeleteDialogError(message);
    } finally {
      setDeletingEntryId((current) => (current === entryId ? null : current));
    }
  }

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  const deleteDialogTitle = `delete-entry-title-${
    entryPendingDelete?.clientKey ?? "dialog"
  }`;
  const deleteDialogBusy =
    entryPendingDelete !== null && deletingEntryId === entryPendingDelete.clientKey;

  return (
    <div
      className="journal-app min-h-screen min-h-[100svh] bg-[var(--bg)] px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5"
      style={journalTheme}
    >
      <div className="mx-auto w-full lg:w-fit lg:max-w-[calc(100vw-40px)]">
        <div className="flex w-full flex-wrap items-center justify-end gap-2 pb-2">
          <Tooltip label="Profile" align="end">
            <Link
              aria-label="Profile"
              className={`group ${utilityButtonClass}`}
              href="/profile"
            >
              <UserRound className="size-3.5" strokeWidth={1.7} />
            </Link>
          </Tooltip>
          <Tooltip label={`Switch to ${nextThemeLabel} theme`} align="end">
            <button
              aria-label={`Switch to ${nextThemeLabel} theme`}
              className={`group ${utilityButtonClass}`}
              type="button"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <SunMedium className="size-3.5" strokeWidth={1.7} />
              ) : (
                <Moon className="size-3.5" strokeWidth={1.7} />
              )}
            </button>
          </Tooltip>
          <Tooltip label="Log out" align="end">
            <button
              aria-label="Log out"
              className={`group ${utilityButtonClass}`}
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="size-3.5" strokeWidth={1.7} />
            </button>
          </Tooltip>
        </div>
        <div className="grid min-h-[calc(100svh-28px)] w-full overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--bg)] lg:w-fit lg:max-w-[calc(100vw-40px)] lg:grid-cols-[240px_auto] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)]">
          <NotebookSidebar
            entries={entries}
            activeEntryId={activeEntry?.clientKey ?? null}
            deletingEntryId={deletingEntryId}
            isCreating={isCreating}
            isLoading={loadState === "loading"}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleRequestDeleteEntry}
            onSelectEntry={handleSelectEntry}
          />
          <NotebookPage
            activeEntry={activeEntry}
            isLoading={loadState === "loading"}
            pageNumber={pageNumber}
            sentimentOptions={sentimentOptions}
            statusMessage={statusMessage}
            titleRef={titleRef}
            onTitleInput={handleTitleInput}
            onBodyInput={handleBodyInput}
            onSelectSentiment={handleSelectSentiment}
          />
        </div>
      </div>
      {entryPendingDelete ? (
        <div
          aria-modal="true"
          aria-labelledby={deleteDialogTitle}
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          style={{
            backgroundColor:
              theme === "dark" ? "rgba(12, 10, 8, 0.58)" : "rgba(44, 42, 39, 0.14)",
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
                aria-label="Close delete dialog"
                className="inline-flex size-8 items-center justify-center rounded-full border-[0.5px] border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:opacity-50"
                type="button"
                onClick={handleCloseDeleteDialog}
                disabled={deleteDialogBusy}
              >
                <X className="size-3.5" strokeWidth={1.7} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] [font-family:var(--font-dm-mono),monospace]">
                Delete entry
              </p>
              <div className="space-y-2">
                <h2
                  className="text-[30px] font-medium leading-[1.05] text-[var(--text)] [font-family:var(--font-lora),serif]"
                  id={deleteDialogTitle}
                >
                  Remove this page?
                </h2>
                <p className="max-w-[30ch] text-[14px] leading-6 text-[var(--muted)]">
                  <span className="text-[var(--text)]">
                    {entryPendingDelete.title.trim() || "Untitled"}
                  </span>{" "}
                  will be deleted from your journal.
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
                disabled={deleteDialogBusy}
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--button-primary-bg)] px-4 text-[12px] uppercase tracking-[0.2em] text-[var(--button-primary-text)] transition hover:bg-[var(--button-primary-hover)] disabled:opacity-50"
                type="button"
                onClick={handleConfirmDeleteEntry}
                disabled={deleteDialogBusy}
              >
                {deleteDialogBusy ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
