export type MongoIdentifier =
  | string
  | {
      $oid?: string;
      hexString?: string;
      time?: number;
      timestamp?: number;
      machineIdentifier?: number;
      processIdentifier?: number;
      counter?: number;
      date?: string;
    };

export type JournalSentiment = string | null;

export interface ApiJournalEntry {
  id?: MongoIdentifier;
  title: string;
  content?: string | null;
  entryDate?: string | null;
  sentiment?: JournalSentiment;
}

export interface JournalEntryRecord {
  id: string | null;
  clientKey: string;
  title: string;
  content: string;
  entryDate: string | null;
  sentiment: JournalSentiment;
}

export interface User {
  id?: MongoIdentifier;
  userName: string;
  password?: string;
  email?: string | null;
  sentimentAnalysis?: boolean;
  journalEntries?: ApiJournalEntry[];
  roles?: string[];
}

export interface ApiUserProfile {
  userName: string;
  email?: string | null;
  sentimentAnalysis?: boolean;
}

export interface UserProfile {
  userName: string;
  email: string;
  sentimentAnalysis: boolean;
}

export interface LoginValues {
  userName: string;
  password: string;
}

export interface SignupValues {
  userName: string;
  email: string;
  password: string;
  sentimentAnalysis: boolean;
}

export interface ProfileValues {
  email: string;
  sentimentAnalysis: boolean;
}

export interface PasswordChangeValues {
  newPassword: string;
  confirmPassword: string;
}

function toHexSegment(value: number, length: number) {
  return value.toString(16).padStart(length, "0").slice(-length);
}

export function getIdentifierValue(id: MongoIdentifier | null | undefined) {
  if (!id) {
    return null;
  }

  if (typeof id === "string") {
    return id;
  }

  if (typeof id.$oid === "string") {
    return id.$oid;
  }

  if (typeof id.hexString === "string") {
    return id.hexString;
  }

  const timestamp = id.time ?? id.timestamp;

  if (
    typeof timestamp === "number" &&
    typeof id.machineIdentifier === "number" &&
    typeof id.processIdentifier === "number" &&
    typeof id.counter === "number"
  ) {
    return [
      toHexSegment(timestamp, 8),
      toHexSegment(id.machineIdentifier, 6),
      toHexSegment(id.processIdentifier, 4),
      toHexSegment(id.counter, 6),
    ].join("");
  }

  return null;
}

export function toJournalEntryRecord(
  entry: ApiJournalEntry
): JournalEntryRecord {
  const routeId = getIdentifierValue(entry.id);

  return {
    id: routeId,
    clientKey: routeId ?? crypto.randomUUID(),
    title: entry.title ?? "",
    content: entry.content ?? "",
    entryDate: entry.entryDate ?? null,
    sentiment: entry.sentiment ?? null,
  };
}

export function toJournalEntryRecords(entries: ApiJournalEntry[]) {
  return entries
    .map((entry) => toJournalEntryRecord(entry))
    .sort((left, right) => {
      const leftTime = left.entryDate ? new Date(left.entryDate).getTime() : 0;
      const rightTime = right.entryDate ? new Date(right.entryDate).getTime() : 0;
      return rightTime - leftTime;
    });
}

export function toUserProfile(profile: ApiUserProfile): UserProfile {
  return {
    userName: profile.userName ?? "",
    email: profile.email ?? "",
    sentimentAnalysis: profile.sentimentAnalysis ?? false,
  };
}
