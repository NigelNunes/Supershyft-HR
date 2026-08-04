import { createContext, useContext, useMemo, type ReactNode } from 'react';
import abcLogo from '../assets/abc-logo.svg';
import { DEMO_MODE, DEMO_ORG_ID, DEMO_ORG_NAME } from '../config/demo';
import { DEPARTMENTS, departmentSlug } from '../data/participantPool';
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

/** Normalize /organizations/me department entries into { department, slug }. */
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
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return trimmed;
}

const DEMO_ORGANIZATION: ApiMyOrganization = {
  organization_id: DEMO_ORG_ID,
  name: DEMO_ORG_NAME,
  organization_type: 'corporate',
  logo: abcLogo,
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  departments: DEPARTMENTS.map((department) => ({
    department,
    slug: departmentSlug(department),
  })),
  status: 'active',
};

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { selectedCampOrganizationName } = useCamp();

  const value = useMemo<OrganizationContextValue>(() => {
    if (!DEMO_MODE || !isAuthenticated) {
      return {
        activeOrganization: null,
        organizationName: selectedCampOrganizationName ?? 'Organization',
        organizationLogo: null,
        departments: [],
        loading: false,
        error: null,
      };
    }

    return {
      activeOrganization: DEMO_ORGANIZATION,
      organizationName: DEMO_ORG_NAME,
      organizationLogo: abcLogo,
      departments: normalizeOrganizationDepartments(DEMO_ORGANIZATION.departments),
      loading: false,
      error: null,
    };
  }, [isAuthenticated, selectedCampOrganizationName]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
