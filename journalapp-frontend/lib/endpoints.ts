export function getApiBaseUrl(): string {
  return "https://journalappapi-gwd2g7c8fdc5g9fw.centralindia-01.azurewebsites.net";
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
