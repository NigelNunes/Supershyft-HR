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
const AUTH_KEY = 'hr-dashboard-auth';
const TOKEN_KEY = 'hr-dashboard-token';
const REFRESH_TOKEN_KEY = 'hr-dashboard-refresh-token';
const DEMO_SESSION_KEY = 'hr-dashboard-demo-session';

function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (sessionStorage.getItem(AUTH_KEY) !== '1') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_KEY) === '1' && Boolean(sessionStorage.getItem(TOKEN_KEY));
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<ApiCurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(() => Boolean(readStoredToken()));

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    let cancelled = false;
    setUserLoading(true);

    void usersApi
      .me(accessToken)
      .then((me) => {
        if (cancelled) return;
        setUser(me);
      })
      .catch(() => {
        // Camp picker may still load camps; role can be fetched again there if missing.
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken]);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      const normalizedPhone = phone.replace(/\D/g, '');
      const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6);
      const result = await authApi.verifyOtp(normalizedPhone, normalizedOtp);
      const { access_token, refresh_token } = result.tokens;

      sessionStorage.setItem(AUTH_KEY, '1');
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      sessionStorage.removeItem(DEMO_SESSION_KEY);

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
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    clearStoredAuth();
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
