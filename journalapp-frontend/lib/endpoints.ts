export function getApiBaseUrl(): string {
  const apiBaseUrl = (globalThis as typeof globalThis & {
    process?: {
      env?: {
        NEXT_PUBLIC_API_BASE_URL?: string;
      };
    };
  }).process?.env?.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

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
