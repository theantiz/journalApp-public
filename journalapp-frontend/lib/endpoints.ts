const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const ENDPOINTS = {
  healthCheck: "/journal/public/health-check",
  login: "/journal/public/login",
  signup: "/journal/public/signup",
  user: "/journal/user",
  userProfile: "/journal/user/profile",
  userPassword: "/journal/user/password",
  journals: "/journal/journal",
  journalSentiments: "/journal/journal/sentiments",
  journalById: (journalId: string) => `/journal/journal/${journalId}`,
} as const;
