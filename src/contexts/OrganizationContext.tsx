import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { organizationsApi } from '../services/api';
import type { ApiMyOrganization } from '../services/apiTypes';
import { useAuth } from './AuthContext';
import { useCamp } from './CampContext';

const API_BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

interface OrganizationContextValue {
  activeOrganization: ApiMyOrganization | null;
  organizationName: string;
  organizationLogo: string | null;
  departments: NonNullable<ApiMyOrganization['departments']>;
  loading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function resolveOrganizationLogoUrl(logo: string | null | undefined): string | null {
  const trimmed = logo?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!API_BASE) return trimmed;
  return `${API_BASE.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`;
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const { selectedCampOrganizationId, selectedCampOrganizationName } = useCamp();
  const [activeOrganization, setActiveOrganization] = useState<ApiMyOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || selectedCampOrganizationId == null) {
      setActiveOrganization(null);
      setLoading(false);
      setError(null);
      return;
    }

    const organizationId = selectedCampOrganizationId;
    let cancelled = false;
    setLoading(true);
    setError(null);

    organizationsApi
      .getForSelectedCamp(organizationId, accessToken)
      .then((organization) => {
        if (cancelled) return;
        setActiveOrganization(organization);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setActiveOrganization(null);
        setError(err instanceof Error ? err.message : 'Failed to load organization');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, selectedCampOrganizationId]);

  const value = useMemo<OrganizationContextValue>(() => {
    const organizationName = activeOrganization?.name ?? selectedCampOrganizationName ?? 'Organization';

    return {
      activeOrganization,
      organizationName,
      organizationLogo: resolveOrganizationLogoUrl(activeOrganization?.logo),
      departments: activeOrganization?.departments ?? [],
      loading,
      error,
    };
  }, [activeOrganization, selectedCampOrganizationName, loading, error]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
