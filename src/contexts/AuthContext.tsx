import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, usersApi } from '../services/api';
import type { ApiCurrentUser } from '../services/apiTypes';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  hasStoredSession,
  refreshAccessToken,
  setAuthTokens,
  subscribeAuthTokens,
} from '../services/authStorage';

interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: ApiCurrentUser | null;
  userLoading: boolean;
  isDemoSession: boolean;
  login: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasStoredSession());
  const [user, setUser] = useState<ApiCurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(() => hasStoredSession());

  // Keep React state in sync when tokens refresh/clear from the API layer.
  useEffect(() => {
    return subscribeAuthTokens((token) => {
      setAccessToken(token);
      setIsAuthenticated(Boolean(token));
      if (!token) {
        setUser(null);
        setUserLoading(false);
      }
    });
  }, []);

  // Load current user once per authenticated session. 401s are refreshed inside the API client.
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setIsAuthenticated(false);
      setUserLoading(false);
      return;
    }

    let cancelled = false;
    setUserLoading(true);

    void (async () => {
      try {
        const me = await usersApi.me(token);
        if (cancelled) return;
        setUser(me);
        const latest = getAccessToken();
        if (latest) setAccessToken(latest);
      } catch {
        if (cancelled) return;
        // Explicit refresh if the first me() failed (e.g. expired access, refresh not yet tried).
        if (getRefreshToken()) {
          const next = await refreshAccessToken(authApi.refreshToken);
          if (cancelled) return;
          if (next) {
            try {
              const me = await usersApi.me(next);
              if (cancelled) return;
              setAccessToken(next);
              setUser(me);
              return;
            } catch {
              // fall through
            }
          }
        }
        clearAuthTokens();
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      const normalizedPhone = phone.replace(/\D/g, '');
      const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6);
      const result = await authApi.verifyOtp(normalizedPhone, normalizedOtp);
      const { access_token, refresh_token } = result.tokens;

      setAuthTokens(access_token, refresh_token);
      setAccessToken(access_token);
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
    const refreshToken = getRefreshToken();
    clearAuthTokens();
    setAccessToken(null);
    setUser(null);
    setUserLoading(false);
    setIsAuthenticated(false);

    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => {
        // Ignore logout API failures after local session is cleared.
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      accessToken,
      user,
      userLoading,
      isDemoSession: false,
      login,
      logout,
    }),
    [isAuthenticated, accessToken, user, userLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
