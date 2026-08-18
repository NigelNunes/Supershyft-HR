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
import type { ApiOrganizationCamp } from '../services/apiTypes';
import {
  buildCampYearChoices,
  campForYear,
  yearFromCampStartDate,
  type CampYearChoice,
  type CampYearOption,
} from '../utils/campYears';
import { useAuth } from './AuthContext';

interface CampContextValue {
  selectedCampNo: number | null;
  selectedCampName: string | null;
  selectedCampOrganizationId: number | null;
  selectedCampOrganizationName: string | null;
  organizationCamps: ApiOrganizationCamp[];
  campsLoading: boolean;
  yearOptions: CampYearChoice[];
  selectedYear: CampYearOption;
  setSelectedYear: (year: CampYearOption) => void;
  selectCamp: (
    campNo: number,
    organizationId?: number,
    organizationName?: string,
    campName?: string,
    startDate?: string | null,
  ) => Promise<{ ok: boolean; error?: string }>;
  clearCamp: () => void;
}

const CampContext = createContext<CampContextValue | null>(null);
const CAMP_NO_KEY = 'hr-dashboard-camp-no';
const CAMP_NAME_KEY = 'hr-dashboard-camp-name';
const CAMP_ORG_ID_KEY = 'hr-dashboard-camp-org-id';
const CAMP_ORG_NAME_KEY = 'hr-dashboard-camp-org-name';
const CAMP_YEAR_KEY = 'hr-dashboard-camp-year';

function readStoredCampNo(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CAMP_NO_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readStoredOrgId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CAMP_ORG_ID_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readStoredOrgName(): string | null {
  if (typeof window === 'undefined') return null;
  const name = sessionStorage.getItem(CAMP_ORG_NAME_KEY)?.trim();
  return name || null;
}

function readStoredCampName(): string | null {
  if (typeof window === 'undefined') return null;
  const name = sessionStorage.getItem(CAMP_NAME_KEY)?.trim();
  return name || null;
}

function readStoredYear(): CampYearOption | null {
  if (typeof window === 'undefined') return null;
  const year = sessionStorage.getItem(CAMP_YEAR_KEY)?.trim();
  return year || null;
}

function persistCamp(
  campNo: number,
  organizationId: number,
  organizationName: string,
  campName: string,
  year?: string | null,
) {
  sessionStorage.setItem(CAMP_NO_KEY, String(campNo));
  if (organizationId > 0) sessionStorage.setItem(CAMP_ORG_ID_KEY, String(organizationId));
  else sessionStorage.removeItem(CAMP_ORG_ID_KEY);
  if (organizationName.trim()) {
    sessionStorage.setItem(CAMP_ORG_NAME_KEY, organizationName.trim());
  } else {
    sessionStorage.removeItem(CAMP_ORG_NAME_KEY);
  }
  if (campName.trim()) sessionStorage.setItem(CAMP_NAME_KEY, campName.trim());
  else sessionStorage.removeItem(CAMP_NAME_KEY);
  if (year?.trim()) sessionStorage.setItem(CAMP_YEAR_KEY, year.trim());
}

export function CampProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken, user } = useAuth();
  const [selectedCampNo, setSelectedCampNo] = useState<number | null>(() => readStoredCampNo());
  const [selectedCampName, setSelectedCampName] = useState<string | null>(() =>
    readStoredCampName(),
  );
  const [selectedCampOrganizationId, setSelectedCampOrganizationId] = useState<number | null>(() =>
    readStoredOrgId(),
  );
  const [selectedCampOrganizationName, setSelectedCampOrganizationName] = useState<string | null>(
    () => readStoredOrgName(),
  );
  const [organizationCamps, setOrganizationCamps] = useState<ApiOrganizationCamp[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [selectedYear, setSelectedYearState] = useState<CampYearOption>(
    () => readStoredYear() ?? 'all',
  );

  const clearCamp = useCallback(() => {
    sessionStorage.removeItem(CAMP_NO_KEY);
    sessionStorage.removeItem(CAMP_NAME_KEY);
    sessionStorage.removeItem(CAMP_ORG_ID_KEY);
    sessionStorage.removeItem(CAMP_ORG_NAME_KEY);
    sessionStorage.removeItem(CAMP_YEAR_KEY);
    setSelectedCampNo(null);
    setSelectedCampName(null);
    setSelectedCampOrganizationId(null);
    setSelectedCampOrganizationName(null);
    setOrganizationCamps([]);
    setSelectedYearState('all');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCamp();
      return;
    }

    setSelectedCampNo(readStoredCampNo());
    setSelectedCampName(readStoredCampName());
    setSelectedCampOrganizationId(readStoredOrgId());
    setSelectedCampOrganizationName(readStoredOrgName());
    setSelectedYearState(readStoredYear() ?? 'all');
  }, [isAuthenticated, clearCamp]);

  // Resolve missing camp/org labels from the same role-based camps list used at select-camp.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !selectedCampNo) return;

    const needsCampName = !selectedCampName;
    const needsOrg =
      selectedCampOrganizationId == null ||
      selectedCampOrganizationId <= 0 ||
      !selectedCampOrganizationName?.trim();
    if (!needsCampName && !needsOrg) return;

    let cancelled = false;
    const campNo = selectedCampNo;
    const role = user?.employee?.role ?? null;

    void organizationsApi
      .listCampsForUser(accessToken, role)
      .then(({ items }) => {
        if (cancelled) return;
        const match = items.find((camp) => camp.camp_no === campNo);
        if (!match) return;

        const orgId = match.organization_id;
        const orgName = match.organization_name?.trim() || '';
        const campName = match.camp_name?.trim() || selectedCampName || '';
        const year = yearFromCampStartDate(match.start_date);
        if (!campName && !orgName && !(orgId > 0)) return;

        persistCamp(campNo, orgId || 0, orgName, campName, year);
        if (campName) setSelectedCampName(campName);
        if (orgId > 0) setSelectedCampOrganizationId(orgId);
        if (orgName) setSelectedCampOrganizationName(orgName);
        if (year) setSelectedYearState(year);
      })
      .catch(() => {
        // Keep stored values until the user reselects a camp.
      });

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    accessToken,
    selectedCampNo,
    selectedCampName,
    selectedCampOrganizationId,
    selectedCampOrganizationName,
    user,
  ]);

  // Load GET /organizations/{organization_id}/camps for year ↔ camp mapping.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !selectedCampOrganizationId) {
      setOrganizationCamps([]);
      setCampsLoading(false);
      return;
    }

    let cancelled = false;
    setCampsLoading(true);

    void organizationsApi
      .listAllCamps(selectedCampOrganizationId, accessToken)
      .then(({ items }) => {
        if (cancelled) return;
        setOrganizationCamps(items);
        setCampsLoading(false);

        const choices = buildCampYearChoices(items);
        const valid = new Set(choices.map((c) => c.value));
        const fromCamp = yearFromCampStartDate(
          items.find((c) => c.camp_no === selectedCampNo)?.start_date,
        );

        setSelectedYearState((prev) => {
          const next =
            (prev && valid.has(prev) ? prev : null) ||
            (fromCamp && valid.has(fromCamp) ? fromCamp : null) ||
            choices[0]?.value ||
            'all';
          if (next !== prev) sessionStorage.setItem(CAMP_YEAR_KEY, next);
          return next;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setOrganizationCamps([]);
        setCampsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, selectedCampOrganizationId, selectedCampNo]);

  const yearOptions = useMemo(
    () => buildCampYearChoices(organizationCamps),
    [organizationCamps],
  );

  const selectCamp = useCallback(
    async (
      campNo: number,
      organizationId?: number,
      organizationName?: string,
      campName?: string,
      startDate?: string | null,
    ) => {
      if (!accessToken) {
        return { ok: false, error: 'Not authenticated' };
      }

      try {
        await campDashboardApi.section(campNo, 'kpis', accessToken);

        const orgId = organizationId != null && organizationId > 0 ? organizationId : 0;
        const orgName = organizationName?.trim() ?? '';
        const name = campName?.trim() ?? '';
        const year = yearFromCampStartDate(startDate) ?? readStoredYear();
        persistCamp(campNo, orgId, orgName, name, year);
        setSelectedCampNo(campNo);
        setSelectedCampName(name || null);
        setSelectedCampOrganizationId(orgId > 0 ? orgId : null);
        setSelectedCampOrganizationName(orgName || null);
        if (year) setSelectedYearState(year);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Unable to access this camp.',
        };
      }
    },
    [accessToken],
  );

  const setSelectedYear = useCallback(
    (year: CampYearOption) => {
      setSelectedYearState(year);
      sessionStorage.setItem(CAMP_YEAR_KEY, year);

      if (year === 'all' || !accessToken) return;

      const camp = campForYear(organizationCamps, year);
      if (!camp || camp.camp_no === selectedCampNo) return;

      void selectCamp(
        camp.camp_no,
        camp.organization_id,
        camp.organization_name,
        camp.camp_name,
        camp.start_date,
      );
    },
    [accessToken, organizationCamps, selectedCampNo, selectCamp],
  );

  const value = useMemo(
    () => ({
      selectedCampNo: isAuthenticated ? selectedCampNo : null,
      selectedCampName: isAuthenticated ? selectedCampName : null,
      selectedCampOrganizationId: isAuthenticated ? selectedCampOrganizationId : null,
      selectedCampOrganizationName: isAuthenticated ? selectedCampOrganizationName : null,
      organizationCamps: isAuthenticated ? organizationCamps : [],
      campsLoading: isAuthenticated ? campsLoading : false,
      yearOptions: isAuthenticated ? yearOptions : [],
      selectedYear: isAuthenticated ? selectedYear : 'all',
      setSelectedYear,
      selectCamp,
      clearCamp,
    }),
    [
      isAuthenticated,
      selectedCampNo,
      selectedCampName,
      selectedCampOrganizationId,
      selectedCampOrganizationName,
      organizationCamps,
      campsLoading,
      yearOptions,
      selectedYear,
      setSelectedYear,
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
