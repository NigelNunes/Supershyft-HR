import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEMO_CAMP_NO, DEMO_ORG_ID, DEMO_ORG_NAME } from '../config/demo';
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

function storeDemoCamp() {
  sessionStorage.setItem(CAMP_NO_KEY, String(DEMO_CAMP_NO));
  sessionStorage.setItem(CAMP_ORG_ID_KEY, String(DEMO_ORG_ID));
  sessionStorage.setItem(CAMP_ORG_NAME_KEY, DEMO_ORG_NAME);
}

export function CampProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [selectedCampNo, setSelectedCampNo] = useState<number | null>(DEMO_CAMP_NO);
  const [selectedCampOrganizationId, setSelectedCampOrganizationId] = useState<number | null>(
    DEMO_ORG_ID,
  );
  const [selectedCampOrganizationName, setSelectedCampOrganizationName] = useState<string | null>(
    DEMO_ORG_NAME,
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
      return;
    }
    storeDemoCamp();
    setSelectedCampNo(DEMO_CAMP_NO);
    setSelectedCampOrganizationId(DEMO_ORG_ID);
    setSelectedCampOrganizationName(DEMO_ORG_NAME);
  }, [isAuthenticated, clearCamp]);

  const selectCamp = useCallback(async () => {
    storeDemoCamp();
    setSelectedCampNo(DEMO_CAMP_NO);
    setSelectedCampOrganizationId(DEMO_ORG_ID);
    setSelectedCampOrganizationName(DEMO_ORG_NAME);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      selectedCampNo: isAuthenticated ? (selectedCampNo ?? DEMO_CAMP_NO) : null,
      selectedCampOrganizationId: isAuthenticated
        ? (selectedCampOrganizationId ?? DEMO_ORG_ID)
        : null,
      selectedCampOrganizationName: isAuthenticated
        ? (selectedCampOrganizationName ?? DEMO_ORG_NAME)
        : null,
      selectCamp,
      clearCamp,
    }),
    [
      isAuthenticated,
      selectedCampNo,
      selectedCampOrganizationId,
      selectedCampOrganizationName,
      selectCamp,
      clearCamp,
    ],
  );

  return <CampContext.Provider value={value}>{children}</CampContext.Provider>;
}

export function useCamp() {
  const ctx = useContext(CampContext);
  if (!ctx) throw new Error('useCamp must be used within CampProvider');
  return ctx;
}
