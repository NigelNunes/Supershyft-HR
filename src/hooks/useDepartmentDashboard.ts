import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { campDashboardApi } from '../services/api';
import type {
  ApiCampDashboardCompanyAverageScores,
  ApiCampDashboardGenderDistributionPair,
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardParticipationByAge,
  CampDashboardSection,
} from '../services/apiTypes';
import {
  mapCampCompanyAverageScores,
  mapCampKpis,
  mapCampOverallRiskScore,
  mapCampParticipationByAge,
  mapCampPhysicalActivity,
  mapCampSleep,
} from '../services/campDashboardMappers';
import type {
  CompanyAverageScores,
  GenderDistributionPair,
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
} from '../types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

type SectionState<T> = Omit<FetchState<T>, 'refresh'>;

function unwrapSectionPayload<T>(payload: { data: T } | T): T {
  if (
    payload != null &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * GET /reports/camps/{camp_no}/department/{slug}/dashboard?section=…
 * Reuses camp dashboard section names and mappers.
 */
function useDepartmentSection<TApi, TView>(
  slug: string | undefined,
  section: CampDashboardSection,
  map: (api: TApi) => TView,
): FetchState<TView> {
  const { accessToken } = useAuth();
  const { selectedCampNo } = useCamp();
  const [state, setState] = useState<SectionState<TView>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const deptSlug = slug?.trim();
    if (!accessToken || !selectedCampNo || !deptSlug) {
      setState({
        data: null,
        loading: false,
        error: !deptSlug ? 'Department not selected' : 'Not authenticated',
      });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    void campDashboardApi
      .departmentSection<TApi>(selectedCampNo, deptSlug, section, accessToken)
      .then((payload) => {
        if (cancelled) return;
        const api = unwrapSectionPayload(payload);
        setState({ data: map(api), loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampNo, slug, section, map]);

  const refresh = useCallback((): Promise<void> => {
    const deptSlug = slug?.trim();
    if (!accessToken || !selectedCampNo || !deptSlug) return Promise.resolve();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    return campDashboardApi
      .departmentSection<TApi>(selectedCampNo, deptSlug, section, accessToken)
      .then((payload) => {
        const api = unwrapSectionPayload<TApi>(payload);
        setState({ data: map(api), loading: false, error: null });
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to refresh',
        }));
      });
  }, [accessToken, selectedCampNo, slug, section, map]);

  return { ...state, refresh };
}

const mapKpis = (api: ApiCampDashboardKpis) => mapCampKpis(api);
const mapParticipation = (api: ApiCampDashboardParticipationByAge) =>
  mapCampParticipationByAge(api);
const mapOverallRisk = (api: ApiCampDashboardOverallRiskScore) => mapCampOverallRiskScore(api);
const mapPhysical = (api: ApiCampDashboardGenderDistributionPair) => mapCampPhysicalActivity(api);
const mapSleepFn = (api: ApiCampDashboardGenderDistributionPair) => mapCampSleep(api);
const mapCompanyScores = (api: ApiCampDashboardCompanyAverageScores) =>
  mapCampCompanyAverageScores(api);

export function useDepartmentKpis(slug: string | undefined): FetchState<KpiSummary> {
  return useDepartmentSection(slug, 'kpis', mapKpis);
}

export function useDepartmentParticipationByAge(
  slug: string | undefined,
): FetchState<ParticipationByAge[]> {
  return useDepartmentSection(slug, 'participation_by_age', mapParticipation);
}

export function useDepartmentOverallRiskScore(
  slug: string | undefined,
): FetchState<OverallRiskScoreBucket[]> {
  return useDepartmentSection(slug, 'overall_risk_score', mapOverallRisk);
}

export function useDepartmentPhysicalActivity(
  slug: string | undefined,
): FetchState<GenderDistributionPair> {
  return useDepartmentSection(slug, 'distribution_by_physical_activity_frequency', mapPhysical);
}

export function useDepartmentSleep(slug: string | undefined): FetchState<GenderDistributionPair> {
  return useDepartmentSection(slug, 'distribution_by_sleeping_hours', mapSleepFn);
}

export function useDepartmentCompanyAverageScores(
  slug: string | undefined,
): FetchState<CompanyAverageScores> {
  return useDepartmentSection(slug, 'company_average_scores', mapCompanyScores);
}
