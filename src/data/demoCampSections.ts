/**
 * Maps mockDashboard into the shapes returned by useCamp* hooks.
 */
import { mockDashboard } from './mockDashboard';
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
import type {
  CampOxidativeStressView,
  CampRiskLifestyleView,
} from '../services/campDashboardMappers';

const DEMO_BLOOD_PANELS: BloodParameterPanel[] = [
  { id: 'b12', name: 'Vitamin B12', inRangePercent: 66, abnormalPercent: 34 },
  { id: 'd3', name: 'Vitamin D', inRangePercent: 59, abnormalPercent: 41 },
  { id: 'hba1c', name: 'HbA1c', inRangePercent: 78, abnormalPercent: 22 },
  { id: 'ldl', name: 'LDL Cholesterol', inRangePercent: 71, abnormalPercent: 29 },
  { id: 'tsh', name: 'TSH', inRangePercent: 82, abnormalPercent: 18 },
];

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

export function demoPhysicalActivity(): GenderDistributionPair {
  return mockDashboard.physicalActivityByGender;
}

export function demoSleep(): GenderDistributionPair {
  return mockDashboard.sleepQualityByGender;
}

export function demoOxidativeStress(): CampOxidativeStressView {
  return {
    distribution: mockDashboard.oxidativeStress,
    totalEmployees: mockDashboard.kpis.employeesEnrolled,
  };
}

export function demoRiskLifestyle(): CampRiskLifestyleView {
  return {
    topHighRiskDiseases: mockDashboard.topHighRiskDiseases,
    diseases: mockDashboard.diseases,
  };
}

export function demoPositiveWins(): PositiveWins {
  return mockDashboard.positiveWins;
}

export function demoCompanyScores(): CompanyAverageScores {
  return mockDashboard.companyScores;
}

export function demoBloodPanels(): BloodParameterPanel[] {
  return mockDashboard.bloodPanels.length > 0 ? mockDashboard.bloodPanels : DEMO_BLOOD_PANELS;
}
