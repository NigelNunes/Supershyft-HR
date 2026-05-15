import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO_OTP, DEMO_PHONE, mockDashboard } from '../data/mockDashboard';

interface AuthContextValue {
  isAuthenticated: boolean;
  hr: typeof mockDashboard.hr;
  login: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = 'hr-dashboard-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_KEY) === '1';
  });

  const login = useCallback(async (phone: string, otp: string) => {
    const normalized = phone.replace(/\D/g, '');
    if (normalized !== DEMO_PHONE || otp !== DEMO_OTP) {
      return { ok: false, error: 'Invalid phone number or OTP. Use demo credentials.' };
    }
    sessionStorage.setItem(AUTH_KEY, '1');
    setIsAuthenticated(true);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, hr: mockDashboard.hr, login, logout }),
    [isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
