import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEMO_MODE,
  DEMO_PHONE,
  DEMO_REFRESH_TOKEN,
  DEMO_TOKEN,
  isDemoCredentials,
} from '../config/demo';
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

const DEMO_USER: ApiCurrentUser = {
  user_id: 1,
  first_name: 'Demo',
  last_name: 'HR',
  phone: DEMO_PHONE,
  email: 'hr@abc.demo',
  employee: {
    employee_id: 1,
    role: 'hr_admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return DEMO_MODE && sessionStorage.getItem(AUTH_KEY) === '1';
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !DEMO_MODE) return null;
    return sessionStorage.getItem(TOKEN_KEY) === DEMO_TOKEN ? DEMO_TOKEN : null;
  });
  const [user, setUser] = useState<ApiCurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setUser(null);
      setUserLoading(false);
      return;
    }
    setUser(DEMO_USER);
    setUserLoading(false);
  }, [isAuthenticated, accessToken]);

  const login = useCallback(async (phone: string, otp: string) => {
    if (!isDemoCredentials(phone, otp)) {
      return {
        ok: false,
        error: `Use demo credentials: ${DEMO_PHONE} / 0000`,
      };
    }

    sessionStorage.setItem(AUTH_KEY, '1');
    sessionStorage.setItem(DEMO_SESSION_KEY, '1');
    sessionStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, DEMO_REFRESH_TOKEN);
    setAccessToken(DEMO_TOKEN);
    setUser(DEMO_USER);
    setIsAuthenticated(true);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
    setUserLoading(false);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      accessToken,
      user,
      userLoading,
      isDemoSession: DEMO_MODE && isAuthenticated,
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
