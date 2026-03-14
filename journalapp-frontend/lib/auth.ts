const TOKEN_KEY = "journalapp.token";

type JwtPayload = Record<string, unknown> & {
  sub?: unknown;
  exp?: unknown;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return atob(padded);
}

function getUnquotedToken(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseTokenPayload(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [, payload] = parts;

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function normalizeToken(token: unknown) {
  if (typeof token !== "string") {
    return null;
  }

  const normalizedToken = getUnquotedToken(token);

  if (!normalizedToken) {
    return null;
  }

  const payload = parseTokenPayload(normalizedToken);

  if (!payload || typeof payload.sub !== "string") {
    return null;
  }

  if (
    payload.exp !== undefined &&
    typeof payload.exp !== "number"
  ) {
    return null;
  }

  return normalizedToken;
}

export function saveToken(token: string) {
  const normalizedToken = normalizeToken(token);

  if (!normalizedToken) {
    return null;
  }

  if (typeof window === "undefined") {
    return normalizedToken;
  }

  window.localStorage.setItem(TOKEN_KEY, normalizedToken);
  return normalizedToken;
}

export function removeToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedToken = window.localStorage.getItem(TOKEN_KEY);
  const normalizedToken = normalizeToken(storedToken);

  if (!normalizedToken) {
    window.localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  if (normalizedToken !== storedToken) {
    window.localStorage.setItem(TOKEN_KEY, normalizedToken);
  }

  return normalizedToken;
}

export function getSessionUserName() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = parseTokenPayload(token);
  return typeof payload?.sub === "string" ? payload.sub : null;
}

export function isLoggedIn() {
  const token = getToken();

  if (!token) {
    return false;
  }

  const payload = parseTokenPayload(token);

  if (!payload || typeof payload.sub !== "string") {
    removeToken();
    return false;
  }

  if (payload.exp !== undefined && typeof payload.exp !== "number") {
    removeToken();
    return false;
  }

  if (typeof payload.exp !== "number") {
    return true;
  }

  const isExpired = Date.now() >= payload.exp * 1000;

  if (isExpired) {
    removeToken();
  }

  return !isExpired;
}
