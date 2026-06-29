import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, usersApi } from '../services/api';
import type { ApiCurrentUser } from '../services/apiTypes';

interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: ApiCurrentUser | null;
  userLoading: boolean;
  login: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = 'hr-dashboard-auth';
const TOKEN_KEY = 'hr-dashboard-token';
const REFRESH_TOKEN_KEY = 'hr-dashboard-refresh-token';

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

function readStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function storeTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_KEY) === '1';
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<ApiCurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessToken(null);
      setUser(null);
      setUserLoading(false);
      return;
    }
    const stored = readStoredToken();
    if (stored) {
      setAccessToken(stored);
      return;
    }
    const devToken = import.meta.env.VITE_API_ACCESS_TOKEN as string | undefined;
    if (devToken) {
      sessionStorage.setItem(TOKEN_KEY, devToken);
      setAccessToken(devToken);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    let cancelled = false;
    setUserLoading(true);

    usersApi
      .me(accessToken)
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
          setUserLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setUserLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken]);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      const { tokens } = await authApi.verifyOtp(phone.replace(/\D/g, ''), otp);

      sessionStorage.setItem(AUTH_KEY, '1');
      storeTokens(tokens.access_token, tokens.refresh_token);
      setAccessToken(tokens.access_token);
      setIsAuthenticated(true);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      };
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = readStoredRefreshToken();
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
    setUserLoading(false);
    setIsAuthenticated(false);
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, accessToken, user, userLoading, login, logout }),
    [isAuthenticated, accessToken, user, userLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
