import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { departmentSlug } from '../data/participantPool';
import { organizationsApi } from '../services/api';
import type { ApiMyOrganization, ApiOrganizationDepartment } from '../services/apiTypes';
import { useAuth } from './AuthContext';
import { useCamp } from './CampContext';

interface OrganizationContextValue {
  activeOrganization: ApiMyOrganization | null;
  organizationName: string;
  organizationLogo: string | null;
  departments: ApiOrganizationDepartment[];
  loading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

const API_BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

/** Normalize organization department entries into { department, slug }. */
export function normalizeOrganizationDepartments(
  departments: ApiMyOrganization['departments'],
): ApiOrganizationDepartment[] {
  if (!Array.isArray(departments)) return [];

  const seen = new Set<string>();
  const result: ApiOrganizationDepartment[] = [];

  for (const entry of departments) {
    const rawName =
      typeof entry === 'string'
        ? entry
        : (entry?.department ??
          (entry as { name?: string | null })?.name ??
          '');
    const department = String(rawName).trim();
    if (!department) continue;

    const rawSlug = typeof entry === 'string' ? '' : (entry?.slug ?? '');
    const slug = String(rawSlug).trim() || departmentSlug(department);
    if (!slug || seen.has(slug)) continue;

    seen.add(slug);
    result.push({ department, slug });
  }

  return result;
}

export function resolveOrganizationLogoUrl(logo: string | null | undefined): string | null {
  const trimmed = logo?.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed.startsWith('/api/') ? trimmed : `${API_BASE.replace(/\/$/, '')}${trimmed}`;
  }
  return `${API_BASE.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`;
}

/**
 * Resolve organization_id, then load name/logo from GET /organizations/{organization_id}.
 *
 * Id source:
 * 1. selected camp's organization_id (stored at camp select)
 * 2. else GET /organizations/we → organizations[0].organization_id
 */
async function loadOrganizationDetails(
  token: string,
  selectedOrganizationId: number | null,
): Promise<ApiMyOrganization | null> {
  let organizationId =
    selectedOrganizationId != null && selectedOrganizationId > 0
      ? selectedOrganizationId
      : null;

  if (organizationId == null) {
    const { items } = await organizationsApi.listAllMyOrganizations(token);
    if (!items.length) return null;
    organizationId = items[0].organization_id;
  }

  if (organizationId == null || organizationId <= 0) return null;

  return organizationsApi.get(organizationId, token);
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const {
    selectedCampNo,
    selectedCampOrganizationId,
    selectedCampOrganizationName,
    departments: campDepartments,
    campsLoading,
  } = useCamp();

  const [activeOrganization, setActiveOrganization] = useState<ApiMyOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !selectedCampNo) {
      setActiveOrganization(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadOrganizationDetails(accessToken, selectedCampOrganizationId)
      .then((org) => {
        if (cancelled) return;
        setActiveOrganization(org);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setActiveOrganization(null);
        setError(err instanceof Error ? err.message : 'Failed to load organization');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, selectedCampNo, selectedCampOrganizationId]);

  const value = useMemo<OrganizationContextValue>(() => {
    // Prefer live details from GET /organizations/{id}; fall back to camp select label.
    const organizationName =
      activeOrganization?.name?.trim() ||
      selectedCampOrganizationName?.trim() ||
      '-';
    const organizationLogo = resolveOrganizationLogoUrl(activeOrganization?.logo);

    // Prefer camp-scoped departments from GET /organizations/{id}/camps.
    const orgDepartments = normalizeOrganizationDepartments(activeOrganization?.departments);
    const departments = campDepartments.length > 0 ? campDepartments : orgDepartments;

    return {
      activeOrganization,
      organizationName,
      organizationLogo,
      departments,
      loading: loading || campsLoading,
      error,
    };
  }, [
    activeOrganization,
    selectedCampOrganizationName,
    campDepartments,
    campsLoading,
    loading,
    error,
  ]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
