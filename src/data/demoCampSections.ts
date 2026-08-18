/**
 * Maps mockDashboard into the shapes returned by useCamp* hooks.
 */
import { mockDashboard } from './mockDashboard';
import type {
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  RankingSummary,
} from '../types';
import type { CampRiskLifestyleView } from '../services/campDashboardMappers';

export function demoKpis(): KpiSummary {
  const { kpis, participationByGender } = mockDashboard;
  const male = participationByGender.find((g) => g.gender === 'Male')?.enrolled;
  const female = participationByGender.find((g) => g.gender === 'Female')?.enrolled;
  const bloodTestPercent =
    kpis.bloodTestPercent ??
    (kpis.employeesEnrolled > 0
      ? Math.round((kpis.totalBloodTest / kpis.employeesEnrolled) * 100)
      : 0);
  return {
    ...kpis,
    maleEnrolled: male,
    femaleEnrolled: female,
    bloodTestPercent,
    totalBioAiReports: kpis.totalBioAiReports ?? 0,
    bioAiPercent:
      kpis.bioAiPercent ??
      (kpis.employeesEnrolled > 0 && kpis.totalBioAiReports != null
        ? Math.round((kpis.totalBioAiReports / kpis.employeesEnrolled) * 100)
        : 0),
  };
}

export function demoRanking(): RankingSummary {
  return {
    city: 'Mumbai',
    cityRank: 9,
    industryRank: 8,
  };
}

export function demoParticipationByAge(): ParticipationByAge[] {
  return mockDashboard.participationByAge;
}

export function demoOverallRiskScore(): OverallRiskScoreBucket[] {
  return mockDashboard.overallRiskScore;
}

export function demoRiskLifestyle(): CampRiskLifestyleView {
  return {
    topHighRiskDiseases: mockDashboard.topHighRiskDiseases,
    diseases: mockDashboard.diseases,
  };
}
