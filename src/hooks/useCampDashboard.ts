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
  ApiCampDashboardLeadershipTakeaways,
  ApiPositiveWins,
  CampDashboardSection,
} from '../services/apiTypes';
import {
  mapCampBloodAndLabIntelligence,
  mapCampCompanyAverageScores,
  mapCampKpis,
  mapCampLeadershipTakeaways,
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
  OverallRiskScoreView,
  ParticipationByAgeView,
  PositiveWins,
  RankingSummary,
} from '../types';
import type { LeadershipTakeaway } from '../utils/leadershipTakeaways';
import { isOverallLocation } from '../utils/campCities';
import { parseDashboardSection } from '../utils/unwrapDashboardPayload';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

type SectionState<T> = Omit<FetchState<T>, 'refresh'>;

function useCampSection<TApi, TView>(
  section: CampDashboardSection,
  map: (api: TApi, intelligence: unknown) => TView,
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
        const { data, intelligence } = parseDashboardSection<TApi>(payload);
        setState({ data: map(data, intelligence), loading: false, error: null });
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
          .then((payload) => parseDashboardSection<TApi>(payload))
      : campDashboardApi
          .refresh(selectedCampNo, section, accessToken)
          .then((payload) => parseDashboardSection<TApi>(payload));

    return request
      .then(({ data, intelligence }) => {
        setState({ data: map(data, intelligence), loading: false, error: null });
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
const mapParticipation = (api: ApiCampDashboardParticipationByAge, intelligence: unknown) =>
  mapCampParticipationByAge(api, intelligence);
const mapOverallRisk = (api: ApiCampDashboardOverallRiskScore, intelligence: unknown) =>
  mapCampOverallRiskScore(api, intelligence);
const mapPhysical = (api: ApiCampDashboardGenderDistributionPair, intelligence: unknown) =>
  mapCampPhysicalActivity(api, intelligence);
const mapSleepFn = (api: ApiCampDashboardGenderDistributionPair, intelligence: unknown) =>
  mapCampSleep(api, intelligence);
const mapOxidative = (api: ApiCampDashboardOxidativeStress, intelligence: unknown) =>
  mapCampOxidativeStress(api, intelligence);
const mapRiskLifestyle = (api: ApiCampDashboardDiseaseGenderSection, intelligence: unknown) =>
  mapCampRiskLifestyleByGender(api, intelligence);
const mapPositiveWinsFn = (api: ApiPositiveWins, intelligence: unknown) =>
  mapCampPositiveWins(api, intelligence);
const mapCompanyScores = (api: ApiCampDashboardCompanyAverageScores) =>
  mapCampCompanyAverageScores(api);
const mapBlood = (api: ApiCampDashboardBloodAndLabIntelligence) =>
  mapCampBloodAndLabIntelligence(api);
const mapRankingFn = (api: ApiCampDashboardRanking): RankingSummary | null =>
  mapCampRanking(api);
const mapLeadership = (_api: ApiCampDashboardLeadershipTakeaways, intelligence: unknown) =>
  mapCampLeadershipTakeaways(_api, intelligence);

export function useCampKpis(): FetchState<KpiSummary> {
  return useCampSection('kpis', mapKpis);
}

export function useCampParticipationByAge(): FetchState<ParticipationByAgeView> {
  return useCampSection('participation_by_age', mapParticipation);
}

export function useCampOverallRiskScore(): FetchState<OverallRiskScoreView> {
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

export function useCampLeadershipTakeaways(): FetchState<LeadershipTakeaway[]> {
  return useCampSection('leadership_takeaways', mapLeadership);
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
