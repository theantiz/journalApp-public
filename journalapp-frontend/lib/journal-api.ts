import { apiRequest, isApiError } from "./api";
import { ENDPOINTS } from "./endpoints";
import {
  type JournalSentiment,
  toJournalEntryRecord,
  toJournalEntryRecords,
  type ApiJournalEntry,
  type JournalEntryRecord,
} from "./types";

type JournalMutationValues = {
  title: string;
  content: string;
  sentiment?: JournalSentiment;
};

type JournalMutationOptions = Pick<RequestInit, "keepalive">;

export async function getJournalEntries(): Promise<JournalEntryRecord[]> {
  try {
    const entries = await apiRequest<ApiJournalEntry[]>(ENDPOINTS.journals);
    return toJournalEntryRecords(entries);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getJournalSentiments(): Promise<string[]> {
  return apiRequest<string[]>(ENDPOINTS.journalSentiments);
}

export async function createJournalEntry(values: JournalMutationValues) {
  const entry = await apiRequest<ApiJournalEntry>(ENDPOINTS.journals, {
    method: "POST",
    body: JSON.stringify(values),
  });

  return toJournalEntryRecord(entry);
}

export async function updateJournalEntry(
  journalId: string,
  values: Partial<JournalMutationValues>,
  options: JournalMutationOptions = {}
) {
  const entry = await apiRequest<ApiJournalEntry>(ENDPOINTS.journalById(journalId), {
    method: "PUT",
    body: JSON.stringify(values),
    ...options,
  });

  return toJournalEntryRecord(entry);
}

export async function deleteJournalEntry(journalId: string) {
  return apiRequest<void>(ENDPOINTS.journalById(journalId), {
    method: "DELETE",
  });
}
