import type { JournalEntryRecord, JournalSentiment } from "@/lib/types";

export const NOTEBOOK_TABS = ["write", "read", "all"] as const;

export type NotebookTab = (typeof NOTEBOOK_TABS)[number];
export type JournalEntry = JournalEntryRecord;
export type SentimentOption = Exclude<JournalSentiment, null>;

export const DEFAULT_SENTIMENT_OPTIONS: SentimentOption[] = [
  "HAPPY",
  "SAD",
  "ANGRY",
  "ANXIOUS",
];
