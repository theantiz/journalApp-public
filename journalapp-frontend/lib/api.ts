import { getToken, removeToken } from "./auth";
import { API_BASE_URL } from "./endpoints";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  if (contentType.includes("application/json")) {
    if (!rawBody.trim()) {
      return null;
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  return rawBody;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = true, ...requestOptions } = options;
  const token = getToken();
  const headers = new Headers(requestOptions.headers ?? {});
  const isFormDataBody = requestOptions.body instanceof FormData;

  if (!headers.has("Content-Type") && requestOptions.body && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json, text/plain;q=0.9, */*;q=0.8");

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      cache: "no-store",
      headers,
    });
  } catch (error) {
    throw new ApiError(
      "Can't connect right now. Make sure the app is running and try again.",
      0,
      error
    );
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }

    let message: string;
    if (typeof data === "string" && data.trim().length > 0) {
      message = data;
    } else if (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string") {
      message = (data as { message: string }).message;
    } else if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
      message = (data as { error: string }).error;
    } else if (response.status >= 500) {
      message = "Something went wrong on our end. Please try again in a moment.";
    } else {
      message = `Request failed with ${response.status}`;
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
