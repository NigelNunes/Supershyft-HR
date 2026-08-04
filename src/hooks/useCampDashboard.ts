import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import {
  demoBloodPanels,
  demoCompanyScores,
  demoKpis,
  demoOverallRiskScore,
  demoOxidativeStress,
  demoParticipationByAge,
  demoPhysicalActivity,
  demoPositiveWins,
  demoRanking,
  demoRiskLifestyle,
  demoSleep,
} from '../data/demoCampSections';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Pure offline demo — never calls the camp dashboard API. */
function useDemoSection<T>(getData: () => T): FetchState<T> {
  const { accessToken } = useAuth();
  const { selectedCampNo } = useCamp();
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!accessToken || !selectedCampNo) {
      setState({ data: null, loading: false, error: 'Not authenticated' });
      return;
    }
    setState({ data: getData(), loading: false, error: null });
  }, [accessToken, selectedCampNo, getData]);

  return state;
}

export function useCampKpis() {
  return useDemoSection(demoKpis);
}

export function useCampParticipationByAge() {
  return useDemoSection(demoParticipationByAge);
}

export function useCampOverallRiskScore() {
  return useDemoSection(demoOverallRiskScore);
}

export function useCampPhysicalActivity() {
  return useDemoSection(demoPhysicalActivity);
}

export function useCampSleep() {
  return useDemoSection(demoSleep);
}

export function useCampOxidativeStress() {
  return useDemoSection(demoOxidativeStress);
}

export function useCampRiskLifestyleByGender() {
  return useDemoSection(demoRiskLifestyle);
}

export function useCampPositiveWins() {
  return useDemoSection(demoPositiveWins);
}

export function useCampCompanyAverageScores() {
  return useDemoSection(demoCompanyScores);
}

export function useCampBloodAndLabIntelligence() {
  return useDemoSection(demoBloodPanels);
}

export function useCampRanking() {
  return useDemoSection(demoRanking);
}
