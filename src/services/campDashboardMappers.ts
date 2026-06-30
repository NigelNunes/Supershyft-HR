import type {
  ApiCampDashboardGenderDistribution,
  ApiCampDashboardGenderDistributionPair,
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardOxidativeStress,
  ApiCampDashboardParticipationByAge,
  ApiCampDashboardDiseaseGenderSection,
  ApiCampDashboardDiseaseGenderItem,
  ApiCampDashboardCompanyAverageScores,
  ApiPositiveWins,
} from './apiTypes';
import { DISEASES } from '../data/diseases';
import type {
  DiseaseDefinition,
  DiseaseRiskData,
  GenderDistributionPair,
  KpiSummary,
  OxidativeStressByDept,
  OverallRiskBand,
  OverallRiskScoreBucket,
  ParticipationByAge,
  PositiveWins,
  RiskLevel,
  TopHighRiskDisease,
  CompanyAverageScores,
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

type OxidativeStressBandField = 'low' | 'moderate' | 'high' | 'veryHigh';

const OXIDATIVE_STRESS_GROUP_FIELDS: Record<string, OxidativeStressBandField> = {
  low: 'low',
  moderate: 'moderate',
  high: 'high',
  very_high: 'veryHigh',
  veryhigh: 'veryHigh',
  'very high': 'veryHigh',
};

export interface CampOxidativeStressView {
  distribution: OxidativeStressByDept[];
  totalEmployees: number;
}

export interface CampRiskLifestyleView {
  topHighRiskDiseases: TopHighRiskDisease[];
  diseases: DiseaseRiskData[];
}

const DEEP_DIVE_EXCLUDED_CODES = new Set(['metabolic_syndrome']);

const RISK_LEVEL_GROUPS: Record<string, RiskLevel> = {
  healthy: 'Healthy',
  increased: 'Increased',
  high: 'High',
  very_high: 'Very High',
  veryhigh: 'Very High',
  'very high': 'Very High',
};

function diseaseDefinitionForCode(code: string): DiseaseDefinition {
  const known = DISEASES.find((disease) => disease.code === code);
  if (known) return known;
  return { code: code as DiseaseDefinition['code'], name: diseaseDisplayName(code) };
}

function diseaseDisplayName(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  const known = DISEASES.find(
    (d) => d.code === normalized || d.name.toLowerCase() === normalized,
  );
  if (known) return known.name;
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function genderHeadcount(side: ApiCampDashboardGenderDistribution): number {
  return side.count.reduce((sum, count) => sum + count, 0);
}

function workforceElevatedPercent(item: ApiCampDashboardDiseaseGenderItem): number {
  const maleTotal = genderHeadcount(item.male);
  const femaleTotal = genderHeadcount(item.female);
  const total = maleTotal + femaleTotal;
  if (total === 0) return 0;

  const maleElevated = item.male.elevated_percent ?? 0;
  const femaleElevated = item.female.elevated_percent ?? 0;
  return Math.round(((maleElevated * maleTotal + femaleElevated * femaleTotal) / total) * 10) / 10;
}

function mapDiseaseGenderItem(item: ApiCampDashboardDiseaseGenderItem): DiseaseRiskData {
  return mapGenderPairToDiseaseRisk(
    { male: item.male, female: item.female },
    diseaseDefinitionForCode(item.code),
  );
}

function riskLevelFromGroup(group: string): RiskLevel | null {
  return RISK_LEVEL_GROUPS[group] ?? RISK_LEVEL_GROUPS[group.toLowerCase()] ?? null;
}

function mapGenderPairToDiseaseRisk(
  api: ApiCampDashboardGenderDistributionPair,
  disease: DiseaseDefinition,
): DiseaseRiskData {
  const levels: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];

  const buckets = levels.map((level) => {
    const maleIdx = api.male.group.findIndex((group) => riskLevelFromGroup(group) === level);
    const femaleIdx = api.female.group.findIndex((group) => riskLevelFromGroup(group) === level);

    return {
      level,
      segments: {
        Male: maleIdx >= 0 ? (api.male.percent[maleIdx] ?? 0) : 0,
        Female: femaleIdx >= 0 ? (api.female.percent[femaleIdx] ?? 0) : 0,
      },
    };
  });

  const healthy = buckets.find((bucket) => bucket.level === 'Healthy');
  const healthySum = healthy
    ? Object.values(healthy.segments).reduce((sum, value) => sum + value, 0) / 2
    : 0;
  const overallStatus: RiskLevel =
    healthySum >= 75
      ? 'Healthy'
      : healthySum >= 55
        ? 'Increased'
        : healthySum >= 40
          ? 'High'
          : 'Very High';

  return { disease, buckets, overallStatus };
}

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

export function mapCampOxidativeStress(api: ApiCampDashboardOxidativeStress): CampOxidativeStressView {
  const distribution: OxidativeStressByDept = {
    department: 'Company-wide',
    low: 0,
    moderate: 0,
    high: 0,
    veryHigh: 0,
  };

  api.group.forEach((group, i) => {
    const field = OXIDATIVE_STRESS_GROUP_FIELDS[group] ?? OXIDATIVE_STRESS_GROUP_FIELDS[group.toLowerCase()];
    if (field) {
      distribution[field] = api.percent[i] ?? 0;
    }
  });

  return {
    distribution: [distribution],
    totalEmployees: api.total_employees,
  };
}

export function mapCampRiskLifestyleByGender(
  api: ApiCampDashboardDiseaseGenderSection,
): CampRiskLifestyleView {
  const items = api.diseases ?? [];

  const topHighRiskDiseases = [...items]
    .sort((a, b) => workforceElevatedPercent(b) - workforceElevatedPercent(a))
    .slice(0, 3)
    .map((item) => ({
      name: diseaseDefinitionForCode(item.code).name,
      highRiskPercent: workforceElevatedPercent(item),
    }));

  const diseases = items
    .filter((item) => !DEEP_DIVE_EXCLUDED_CODES.has(item.code))
    .map(mapDiseaseGenderItem);

  return { topHighRiskDiseases, diseases };
}

export function mapCampCompanyAverageScores(
  api: ApiCampDashboardCompanyAverageScores,
): CompanyAverageScores {
  return {
    nutrition: api.nutrition?.score ?? 0,
    fitness: api.fitness?.score ?? 0,
    lifestyle: api.lifestyle?.score ?? 0,
  };
}

export function mapCampPositiveWins(api: ApiPositiveWins): PositiveWins {
  return {
    lowRisk: (api.low_risk ?? []).map((disease) => ({
      code: disease.code,
      name: disease.name,
      riskStatus: disease.risk_status,
    })),
    healthyHabits: (api.healthy_habits ?? []).map((habit) => ({
      habitLabel: habit.habit_label,
    })),
    healthyProfiles: api.healthy_profiles ?? [],
  };
}
