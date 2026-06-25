import type {
  ApiCampDashboardGenderDistribution,
  ApiCampDashboardGenderDistributionPair,
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardParticipationByAge,
} from './apiTypes';
import type {
  GenderDistributionPair,
  KpiSummary,
  OverallRiskBand,
  OverallRiskScoreBucket,
  ParticipationByAge,
} from '../types';

const OVERALL_RISK_GROUP_LABELS: Record<string, OverallRiskBand> = {
  optimal: 'Optimal',
  low_risk: 'Low risk',
  increased_risk: 'Increased Risk',
  high_risk: 'High risk',
};

const PHYSICAL_ACTIVITY_GROUP_LABELS: Record<string, string> = {
  less_than_30mins: 'Less than 30mins',
  '30_60_mins': '30-60mins',
  more_than_60_mins: 'More than 60 mins',
  rarely_or_never: 'Rarely or Never',
};

const SLEEP_GROUP_LABELS: Record<string, string> = {
  less_than_5hrs: 'Less than 5',
  between_5_7_hrs: '5-7',
  between_7_9_hrs: '7-9',
  more_than_9hrs: 'More than 9',
};

function mapGenderDistributionSide(
  side: ApiCampDashboardGenderDistribution,
  labelMap: Record<string, string>,
) {
  return side.group.map((key, i) => ({
    label: labelMap[key] ?? key.replace(/_/g, ' '),
    percent: side.percent[i] ?? 0,
  }));
}

function mapGenderDistributionPair(
  api: ApiCampDashboardGenderDistributionPair,
  labelMap: Record<string, string>,
): GenderDistributionPair {
  return {
    male: mapGenderDistributionSide(api.male, labelMap),
    female: mapGenderDistributionSide(api.female, labelMap),
  };
}

export function mapCampKpis(api: ApiCampDashboardKpis): KpiSummary {
  return {
    employeesEnrolled: api.employees_enrolled,
    maleEnrolled: api.male_enrolled,
    femaleEnrolled: api.female_enrolled,
    totalBloodTest: api.total_blood_test,
    bloodTestPercent: api.blood_test_percent,
    doctorConsultation: api.doctor_consultation,
    highRiskGroup: api.high_risk_group,
  };
}

export function mapCampParticipationByAge(
  api: ApiCampDashboardParticipationByAge,
): ParticipationByAge[] {
  return api.age_group.map((ageGroup, i) => ({
    ageGroup,
    enrolled: api.enrolled[i] ?? 0,
    percent: api.percent[i] ?? 0,
  }));
}

export function mapCampOverallRiskScore(
  api: ApiCampDashboardOverallRiskScore,
): OverallRiskScoreBucket[] {
  return api.group.map((group, i) => ({
    band: OVERALL_RISK_GROUP_LABELS[group] ?? (group as OverallRiskBand),
    percent: api.percent[i] ?? 0,
    count: api.count[i] ?? 0,
  }));
}

export function mapCampPhysicalActivity(
  api: ApiCampDashboardGenderDistributionPair,
): GenderDistributionPair {
  return mapGenderDistributionPair(api, PHYSICAL_ACTIVITY_GROUP_LABELS);
}

export function mapCampSleep(api: ApiCampDashboardGenderDistributionPair): GenderDistributionPair {
  return mapGenderDistributionPair(api, SLEEP_GROUP_LABELS);
}
