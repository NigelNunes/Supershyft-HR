/**
 * Auth token persistence + single-flight refresh.
 * Access/refresh tokens live in localStorage so sessions survive tab reloads.
 */

export const AUTH_KEY = 'hr-dashboard-auth';
export const TOKEN_KEY = 'hr-dashboard-token';
export const REFRESH_TOKEN_KEY = 'hr-dashboard-refresh-token';
export const DEMO_SESSION_KEY = 'hr-dashboard-demo-session';

type TokenListener = (accessToken: string | null) => void;

const listeners = new Set<TokenListener>();

function storageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const fromLocal = localStorage.getItem(key);
  if (fromLocal != null) return fromLocal;
  // Migrate legacy sessionStorage sessions once.
  const fromSession = sessionStorage.getItem(key);
  if (fromSession != null) {
    localStorage.setItem(key, fromSession);
    sessionStorage.removeItem(key);
    return fromSession;
  }
  return null;
}

function storageSet(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.removeItem(key);
}

function storageRemove(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function getAccessToken(): string | null {
  if (storageGet(AUTH_KEY) !== '1') return null;
  return storageGet(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storageGet(REFRESH_TOKEN_KEY);
}

export function hasStoredSession(): boolean {
  return storageGet(AUTH_KEY) === '1' && Boolean(storageGet(TOKEN_KEY));
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  storageSet(AUTH_KEY, '1');
  storageSet(TOKEN_KEY, accessToken);
  storageSet(REFRESH_TOKEN_KEY, refreshToken);
  storageRemove(DEMO_SESSION_KEY);
  listeners.forEach((listener) => listener(accessToken));
}

export function clearAuthTokens() {
  storageRemove(AUTH_KEY);
  storageRemove(TOKEN_KEY);
  storageRemove(REFRESH_TOKEN_KEY);
  storageRemove(DEMO_SESSION_KEY);
  listeners.forEach((listener) => listener(null));
}

export function subscribeAuthTokens(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type RefreshResult = { access_token: string; refresh_token: string };

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a new access (+ refresh) token pair.
 * Concurrent callers share one in-flight request.
 */
export async function refreshAccessToken(
  refreshFn: (refreshToken: string) => Promise<{ tokens: RefreshResult }>,
): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return null;
    }

    try {
      const result = await refreshFn(refreshToken);
      const { access_token, refresh_token } = result.tokens;
      if (!access_token || !refresh_token) {
        clearAuthTokens();
        return null;
      }
      setAuthTokens(access_token, refresh_token);
      return access_token;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export function readBearerFromHeaders(headers?: HeadersInit): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) {
    const value = headers.get('Authorization') ?? headers.get('authorization');
    return value?.startsWith('Bearer ') ? value.slice(7) : null;
  }
  if (Array.isArray(headers)) {
    const entry = headers.find(([key]) => key.toLowerCase() === 'authorization');
    const value = entry?.[1];
    return value?.startsWith('Bearer ') ? value.slice(7) : null;
  }
  const value =
    (headers as Record<string, string>).Authorization ??
    (headers as Record<string, string>).authorization;
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
}

export function withBearer(headers: HeadersInit | undefined, token: string): HeadersInit {
  return { ...headers, Authorization: `Bearer ${token}` };
}
