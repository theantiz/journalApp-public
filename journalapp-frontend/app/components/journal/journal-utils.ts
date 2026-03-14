const listDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function toDisplayDate(date?: string | null) {
  return date ? new Date(date) : new Date("2026-03-13T00:00:00.000Z");
}

export function countWords(text: string) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

export function formatEntryDate(date?: string | null) {
  return listDateFormatter.format(toDisplayDate(date)).toUpperCase();
}

export function formatFullDate(date?: string | null) {
  return fullDateFormatter.format(toDisplayDate(date)).toUpperCase();
}

export function formatTime(date?: string | null) {
  return timeFormatter.format(toDisplayDate(date));
}

export function formatMetaLine(date?: string | null) {
  return `${formatFullDate(date)} · ${formatTime(date)}`;
}

export function formatSentimentLabel(sentiment?: string | null) {
  if (!sentiment) {
    return "";
  }

  return sentiment.toLowerCase().replace(/_/g, " ");
}

export function getPlainTextContent(value: string) {
  return value.replace(/\u00A0/g, " ");
}

export function placeCaretAtEnd(
  element: HTMLInputElement | HTMLTextAreaElement | null
) {
  if (!element) {
    return;
  }

  const position = element.value.length;
  element.focus();
  element.setSelectionRange(position, position);
}
