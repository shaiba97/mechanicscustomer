const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mechanicsbackend.onrender.com"
).replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const SESSION_EXPIRED_EVENT = "customer:session-expired";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function getToken(): string | null {
  return readStorage(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_TOKEN_KEY);
}

export function setToken(accessToken: string, refreshToken?: string | null): void {
  writeStorage(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken === undefined) return;
  if (refreshToken) {
    writeStorage(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    removeStorage(REFRESH_TOKEN_KEY);
  }
}

export function removeToken(): void {
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
}

function clearSession(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

function messageFrom(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = messageFrom(entry);
      if (message) return message;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["message", "detail", "error", "non_field_errors"]) {
      const message = messageFrom(record[key]);
      if (message) return message;
    }
    for (const entry of Object.values(record)) {
      const message = messageFrom(entry);
      if (message) return message;
    }
  }
  return null;
}

async function send(
  path: string,
  init: RequestInit | undefined,
  token: string | null,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      return null;
    }

    if (!response.ok) {
      clearSession();
      return null;
    }

    let data: { accessToken?: string; refreshToken?: string } | null = null;
    try {
      data = (await response.json()) as {
        accessToken?: string;
        refreshToken?: string;
      };
    } catch {
      data = null;
    }

    if (!data?.accessToken || !data.refreshToken) {
      clearSession();
      return null;
    }

    setToken(data.accessToken, data.refreshToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function toResponse(path: string, init?: RequestInit): Promise<Response> {
  const skipRefresh =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/refresh" ||
    path === "/auth/logout";

  let response = await send(path, init, getToken());

  if (response.status === 401 && !skipRefresh) {
    const token = await refreshAccessToken();
    if (token) {
      response = await send(path, init, token);
    } else if (!getRefreshToken()) {
      removeToken();
    }
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const message =
      messageFrom(body) || `Request failed (${response.status})`;
    throw new ApiError(response.status, message, body);
  }

  return response;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await toResponse(path);
    return (await response.json()) as T;
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await toResponse(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await toResponse(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  },
  async delete(path: string): Promise<void> {
    await toResponse(path, { method: "DELETE" });
  },
};
