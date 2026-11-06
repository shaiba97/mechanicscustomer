"use client";

import * as React from "react";
import { ZodError } from "zod";
import {
  api,
  setToken,
  removeToken,
  getToken,
  getRefreshToken,
  SESSION_EXPIRED_EVENT,
} from "@/lib/api-client";
import { errorMessage } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { LoginInput, RegisterInput } from "@/lib/validators";

export type UserPayload = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  storeId: string | null;
  authProvider: string;
  avatarUrl: string | null;
  isActive: boolean;
  city: string;
  street: string;
  createdAt: string;
};

export function isPhoneAccount(user: UserPayload | null): boolean {
  return !!user && /^\d+$/.test(user.email);
}

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
};

type AuthContextValue = {
  user: UserPayload | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (input: {
    fullName?: string;
    phone?: string;
    email?: string;
    city?: string;
    street?: string;
  }) => Promise<UserPayload>;
  isAuthenticated: boolean;
  authenticate: (phoneNumber: string) => Promise<{ ok: boolean; mode: "login" | "signup"; user: UserPayload; accessToken: string; refreshToken: string }>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserPayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refreshUser = React.useCallback(async () => {
    if (!getToken() && !getRefreshToken()) {
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      const data = await api.get<{ user: UserPayload }>("/auth/me");
      setUser(data.user);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  React.useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setInitializing(false);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = loginSchema.parse(input);
      const res = await api.post<AuthPayload>("/auth/login", parsed);
      setToken(res.accessToken, res.refreshToken);
      setUser(res.user);
      setInitializing(false);
      return res;
    } catch (err: unknown) {
      const message =
        err instanceof ZodError
          ? err.issues[0]?.message ?? "Check your details."
          : errorMessage(err, "Login failed.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = React.useCallback(async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ ok: boolean; mode: "login" | "signup"; user: UserPayload; accessToken: string; refreshToken: string }>("/auth", { phoneNumber: phoneNumber.trim() });
      setToken(res.accessToken, res.refreshToken);
      setUser(res.user);
      setInitializing(false);
      return { ok: true, mode: res.mode, user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
    } catch (err: unknown) {
      const message =
        err instanceof ZodError
          ? err.issues[0]?.message ?? "Check your phone number."
          : "Authentication failed. Please try again.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = React.useCallback(async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = registerSchema.parse(input);
      const res = await api.post<AuthPayload>("/auth/register", parsed);
      setToken(res.accessToken, res.refreshToken);
      setUser(res.user);
      setInitializing(false);
      return res;
    } catch (err: unknown) {
      const message =
        err instanceof ZodError
          ? err.issues[0]?.message ?? "Check your details."
          : errorMessage(err, "Registration failed.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = React.useCallback(
    async (input: {
      fullName?: string;
      phone?: string;
      email?: string;
      city?: string;
      street?: string;
    }) => {
      const res = await api.patch<{ user: UserPayload }>("/auth/me", input);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = React.useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await api.post("/auth/logout", refreshToken ? { refreshToken } : {});
    } catch {}
    removeToken();
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      initializing,
      error,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      isAuthenticated: !!user,
      authenticate,
    }),
    [user, loading, initializing, error, login, register, logout, refreshUser, updateProfile, authenticate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
