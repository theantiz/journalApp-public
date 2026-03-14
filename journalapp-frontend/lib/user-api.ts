import { apiRequest } from "./api";
import { ENDPOINTS } from "./endpoints";
import { type ApiUserProfile, type ProfileValues, toUserProfile } from "./types";

export async function getCurrentUserGreeting() {
  return apiRequest<string>(ENDPOINTS.user);
}

export async function getCurrentUserProfile() {
  const profile = await apiRequest<ApiUserProfile>(ENDPOINTS.userProfile);
  return toUserProfile(profile);
}

export async function updateCurrentUser(values: ProfileValues) {
  const profile = await apiRequest<ApiUserProfile>(ENDPOINTS.user, {
    method: "PUT",
    body: JSON.stringify(values),
  });

  return toUserProfile(profile);
}

export async function updateCurrentUserPassword(newPassword: string) {
  return apiRequest<void>(ENDPOINTS.userPassword, {
    method: "PUT",
    body: JSON.stringify({ newPassword }),
  });
}

export async function deleteCurrentUser() {
  return apiRequest<void>(ENDPOINTS.user, {
    method: "DELETE",
  });
}
