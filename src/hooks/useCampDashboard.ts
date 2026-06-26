import { useEffect, useState } from 'react';
import { DEFAULT_CAMP_NO } from '../config/camp';
import { useAuth } from '../contexts/AuthContext';
import { campDashboardApi } from '../services/api';
import type {
  ApiCampDashboardGenderDistributionPair,
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardOxidativeStress,
  ApiCampDashboardParticipationByAge,
  ApiCampDashboardDiseaseGenderSection,
  ApiPositiveWins,
  CampDashboardSection,
} from '../services/apiTypes';
import {
  mapCampKpis,
  mapCampRiskLifestyleByGender,
  mapCampPositiveWins,
  mapCampOverallRiskScore,
  mapCampOxidativeStress,
  mapCampParticipationByAge,
  mapCampPhysicalActivity,
  mapCampSleep,
} from '../services/campDashboardMappers';
import type {
  CampOxidativeStressView,
  CampRiskLifestyleView,
} from '../services/campDashboardMappers';
import type {
  GenderDistributionPair,
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  PositiveWins,
} from '../types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useCampSection<TApi, TMapped>(
  section: CampDashboardSection,
  map: (api: TApi) => TMapped,
): FetchState<TMapped> {
  const { accessToken } = useAuth();
  const [state, setState] = useState<FetchState<TMapped>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!accessToken) {
      setState({ data: null, loading: false, error: 'Not authenticated' });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    campDashboardApi
      .section<TApi>(DEFAULT_CAMP_NO, section, accessToken)
      .then((res) => {
        if (cancelled) return;
        setState({ data: map(res.data), loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Request failed';
        setState({ data: null, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [section, accessToken]);

  return state;
}

export function useCampKpis() {
  return useCampSection<ApiCampDashboardKpis, KpiSummary>('kpis', mapCampKpis);
}

export function useCampParticipationByAge() {
  return useCampSection<ApiCampDashboardParticipationByAge, ParticipationByAge[]>(
    'participation_by_age',
    mapCampParticipationByAge,
  );
}

export function useCampOverallRiskScore() {
  return useCampSection<ApiCampDashboardOverallRiskScore, OverallRiskScoreBucket[]>(
    'overall_risk_score',
    mapCampOverallRiskScore,
  );
}

export function useCampPhysicalActivity() {
  return useCampSection<ApiCampDashboardGenderDistributionPair, GenderDistributionPair>(
    'distribution_by_physical_activity_frequency',
    mapCampPhysicalActivity,
  );
}

export function useCampSleep() {
  return useCampSection<ApiCampDashboardGenderDistributionPair, GenderDistributionPair>(
    'distribution_by_sleeping_hours',
    mapCampSleep,
  );
}

export function useCampOxidativeStress() {
  return useCampSection<ApiCampDashboardOxidativeStress, CampOxidativeStressView>(
    'distribution_by_oxidative_stress',
    mapCampOxidativeStress,
  );
}

/** Risk & lifestyle: top 3 diseases + gender deep-dive distributions. */
export function useCampRiskLifestyleByGender() {
  return useCampSection<ApiCampDashboardDiseaseGenderSection, CampRiskLifestyleView>(
    'distribution_by_gender_by_metabolic_syndrome',
    mapCampRiskLifestyleByGender,
  );
}

export function useCampPositiveWins() {
  return useCampSection<ApiPositiveWins, PositiveWins>('positive_wins', mapCampPositiveWins);
}
