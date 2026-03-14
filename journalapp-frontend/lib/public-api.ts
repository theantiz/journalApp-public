import { normalizeToken, saveToken } from "./auth";
import { apiRequest } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { LoginValues, SignupValues } from "./types";

type LoginResponse =
  | string
  | {
      token?: string | null;
      jwt?: string | null;
      accessToken?: string | null;
    };

function getTokenFromResponse(response: LoginResponse) {
  if (typeof response === "string") {
    return normalizeToken(response);
  }

  return normalizeToken(response.token ?? response.jwt ?? response.accessToken);
}

export async function loginUser(values: LoginValues) {
  const response = await apiRequest<LoginResponse>(ENDPOINTS.login, {
    method: "POST",
    body: JSON.stringify(values),
    auth: false,
  });
  const token = getTokenFromResponse(response);

  if (!token) {
    throw new Error("Login worked, but something went wrong. Try again.");
  }

  saveToken(token);
  return token;
}

export async function signupUser(values: SignupValues) {
  return apiRequest<string>(ENDPOINTS.signup, {
    method: "POST",
    body: JSON.stringify(values),
    auth: false,
  });
}
