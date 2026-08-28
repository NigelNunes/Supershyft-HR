import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { campDashboardApi } from '../services/api';
import type {
  ApiCampDashboardBloodAndLabIntelligence,
  ApiCampDashboardCompanyAverageScores,
  ApiCampDashboardGenderDistributionPair,
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardOxidativeStress,
  ApiCampDashboardParticipationByAge,
  ApiCampDashboardDiseaseGenderSection,
  ApiCampDashboardRanking,
  ApiPositiveWins,
  CampDashboardSection,
} from '../services/apiTypes';
import {
  mapCampBloodAndLabIntelligence,
  mapCampCompanyAverageScores,
  mapCampKpis,
  mapCampOverallRiskScore,
  mapCampOxidativeStress,
  mapCampParticipationByAge,
  mapCampPhysicalActivity,
  mapCampPositiveWins,
  mapCampRanking,
  mapCampRiskLifestyleByGender,
  mapCampSleep,
  type CampOxidativeStressView,
  type CampRiskLifestyleView,
} from '../services/campDashboardMappers';
import type {
  BloodParameterPanel,
  CompanyAverageScores,
  GenderDistributionPair,
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  PositiveWins,
  RankingSummary,
} from '../types';
import { isOverallLocation } from '../utils/campCities';
import { unwrapDashboardPayload } from '../utils/unwrapDashboardPayload';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

type SectionState<T> = Omit<FetchState<T>, 'refresh'>;

function useCampSection<TApi, TView>(
  section: CampDashboardSection,
  map: (api: TApi) => TView,
): FetchState<TView> {
  const { accessToken } = useAuth();
  const { selectedCampNo, selectedCity } = useCamp();
  const cityScoped = !isOverallLocation(selectedCity);
  const [state, setState] = useState<SectionState<TView>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!accessToken || !selectedCampNo) {
      setState({ data: null, loading: false, error: 'Not authenticated' });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    const request = cityScoped
      ? campDashboardApi.citySection<TApi>(selectedCampNo, selectedCity, section, accessToken)
      : campDashboardApi.section<TApi>(selectedCampNo, section, accessToken);

    void request
      .then((payload) => {
        if (cancelled) return;
        const api = unwrapDashboardPayload<TApi>(payload);
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
  }, [accessToken, selectedCampNo, selectedCity, cityScoped, section, map]);

  const refresh = useCallback((): Promise<void> => {
    if (!accessToken || !selectedCampNo) return Promise.resolve();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // City dashboards only expose GET; re-fetch the section. Overall uses PUT /refresh.
    const request = cityScoped
      ? campDashboardApi
          .citySection<TApi>(selectedCampNo, selectedCity, section, accessToken)
          .then((payload) => unwrapDashboardPayload<TApi>(payload))
      : campDashboardApi
          .refresh(selectedCampNo, section, accessToken)
          .then((payload) => unwrapDashboardPayload<TApi>(payload));

    return request
      .then((api) => {
        setState({ data: map(api), loading: false, error: null });
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to refresh',
        }));
      });
  }, [accessToken, selectedCampNo, selectedCity, cityScoped, section, map]);

  return { ...state, refresh };
}

const mapKpis = (api: ApiCampDashboardKpis) => mapCampKpis(api);
const mapParticipation = (api: ApiCampDashboardParticipationByAge) =>
  mapCampParticipationByAge(api);
const mapOverallRisk = (api: ApiCampDashboardOverallRiskScore) => mapCampOverallRiskScore(api);
const mapPhysical = (api: ApiCampDashboardGenderDistributionPair) => mapCampPhysicalActivity(api);
const mapSleepFn = (api: ApiCampDashboardGenderDistributionPair) => mapCampSleep(api);
const mapOxidative = (api: ApiCampDashboardOxidativeStress) => mapCampOxidativeStress(api);
const mapRiskLifestyle = (api: ApiCampDashboardDiseaseGenderSection) =>
  mapCampRiskLifestyleByGender(api);
const mapPositiveWinsFn = (api: ApiPositiveWins) => mapCampPositiveWins(api);
const mapCompanyScores = (api: ApiCampDashboardCompanyAverageScores) =>
  mapCampCompanyAverageScores(api);
const mapBlood = (api: ApiCampDashboardBloodAndLabIntelligence) =>
  mapCampBloodAndLabIntelligence(api);
const mapRankingFn = (api: ApiCampDashboardRanking): RankingSummary | null =>
  mapCampRanking(api);

export function useCampKpis(): FetchState<KpiSummary> {
  return useCampSection('kpis', mapKpis);
}

export function useCampParticipationByAge(): FetchState<ParticipationByAge[]> {
  return useCampSection('participation_by_age', mapParticipation);
}

export function useCampOverallRiskScore(): FetchState<OverallRiskScoreBucket[]> {
  return useCampSection('overall_risk_score', mapOverallRisk);
}

export function useCampPhysicalActivity(): FetchState<GenderDistributionPair> {
  return useCampSection('distribution_by_physical_activity_frequency', mapPhysical);
}

export function useCampSleep(): FetchState<GenderDistributionPair> {
  return useCampSection('distribution_by_sleeping_hours', mapSleepFn);
}

export function useCampOxidativeStress(): FetchState<CampOxidativeStressView> {
  return useCampSection('distribution_by_oxidative_stress', mapOxidative);
}

export function useCampRiskLifestyleByGender(): FetchState<CampRiskLifestyleView> {
  return useCampSection('distribution_by_gender_by_metabolic_syndrome', mapRiskLifestyle);
}

export function useCampPositiveWins(): FetchState<PositiveWins> {
  return useCampSection('positive_wins', mapPositiveWinsFn);
}

export function useCampCompanyAverageScores(): FetchState<CompanyAverageScores> {
  return useCampSection('company_average_scores', mapCompanyScores);
}

export function useCampBloodAndLabIntelligence(): FetchState<BloodParameterPanel[]> {
  return useCampSection('blood_and_lab_intelligence', mapBlood);
}

export function useCampRanking(): FetchState<RankingSummary> {
  const state = useCampSection<ApiCampDashboardRanking, RankingSummary | null>(
    'ranking',
    mapRankingFn,
  );
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh: state.refresh,
  };
}
