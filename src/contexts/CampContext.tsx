import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { campDashboardApi, organizationsApi } from '../services/api';
import { accessDeniedMessage, isAccessDeniedError } from '../services/apiErrors';
import { useAuth } from './AuthContext';

interface CampContextValue {
  selectedCampNo: number | null;
  selectedCampOrganizationId: number | null;
  selectedCampOrganizationName: string | null;
  selectCamp: (
    campNo: number,
    organizationId?: number,
    organizationName?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  clearCamp: () => void;
}

const CampContext = createContext<CampContextValue | null>(null);
const CAMP_NO_KEY = 'hr-dashboard-camp-no';
const CAMP_ORG_ID_KEY = 'hr-dashboard-camp-org-id';
const CAMP_ORG_NAME_KEY = 'hr-dashboard-camp-org-name';

function readStoredCampNo(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(CAMP_NO_KEY);
  if (!stored) return null;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStoredCampOrganizationId(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(CAMP_ORG_ID_KEY);
  if (!stored) return null;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStoredCampOrganizationName(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CAMP_ORG_NAME_KEY);
}

export function CampProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [selectedCampNo, setSelectedCampNo] = useState<number | null>(() => readStoredCampNo());
  const [selectedCampOrganizationId, setSelectedCampOrganizationId] = useState<number | null>(
    () => readStoredCampOrganizationId(),
  );
  const [selectedCampOrganizationName, setSelectedCampOrganizationName] = useState<string | null>(
    () => readStoredCampOrganizationName(),
  );

  const clearCamp = useCallback(() => {
    sessionStorage.removeItem(CAMP_NO_KEY);
    sessionStorage.removeItem(CAMP_ORG_ID_KEY);
    sessionStorage.removeItem(CAMP_ORG_NAME_KEY);
    setSelectedCampNo(null);
    setSelectedCampOrganizationId(null);
    setSelectedCampOrganizationName(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCamp();
    }
  }, [isAuthenticated, clearCamp]);

  useEffect(() => {
    if (!accessToken || !selectedCampNo || selectedCampOrganizationId != null) return;

    let cancelled = false;

    organizationsApi
      .listAllVisibleCamps(accessToken)
      .then(({ items }) => {
        if (cancelled) return;
        const camp = items.find((item) => item.camp_no === selectedCampNo);
        if (!camp) return;

        sessionStorage.setItem(CAMP_ORG_ID_KEY, String(camp.organization_id));
        sessionStorage.setItem(CAMP_ORG_NAME_KEY, camp.organization_name);
        setSelectedCampOrganizationId(camp.organization_id);
        setSelectedCampOrganizationName(camp.organization_name);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampNo, selectedCampOrganizationId]);

  const selectCamp = useCallback(
    async (campNo: number, organizationId?: number, organizationName?: string) => {
      if (!accessToken) {
        return { ok: false, error: 'Not authenticated' };
      }

      try {
        await campDashboardApi.section(campNo, 'kpis', accessToken);
        sessionStorage.setItem(CAMP_NO_KEY, String(campNo));
        if (organizationId != null) {
          sessionStorage.setItem(CAMP_ORG_ID_KEY, String(organizationId));
          setSelectedCampOrganizationId(organizationId);
        }
        if (organizationName) {
          sessionStorage.setItem(CAMP_ORG_NAME_KEY, organizationName);
          setSelectedCampOrganizationName(organizationName);
        }
        setSelectedCampNo(campNo);
        return { ok: true };
      } catch (err) {
        if (isAccessDeniedError(err)) {
          return { ok: false, error: accessDeniedMessage(err) };
        }
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Unable to verify dashboard access',
        };
      }
    },
    [accessToken],
  );

  const value = useMemo(
    () => ({
      selectedCampNo,
      selectedCampOrganizationId,
      selectedCampOrganizationName,
      selectCamp,
      clearCamp,
    }),
    [selectedCampNo, selectedCampOrganizationId, selectedCampOrganizationName, selectCamp, clearCamp],
  );

  return <CampContext.Provider value={value}>{children}</CampContext.Provider>;
}

export function useCamp() {
  const ctx = useContext(CampContext);
  if (!ctx) throw new Error('useCamp must be used within CampProvider');
  return ctx;
}
