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
  ApiCampDashboardBloodAndLabIntelligence,
  ApiCampDashboardRanking,
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
  RankingSummary,
  RiskLevel,
  TopHighRiskDisease,
  CompanyAverageScores,
  BloodParameterPanel,
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

function sideElevatedPercent(side: ApiCampDashboardGenderDistribution): number {
  if (typeof side.elevated_percent === 'number') return side.elevated_percent;

  return side.group.reduce((sum, group, i) => {
    const level = riskLevelFromGroup(group);
    if (level === 'Increased' || level === 'High' || level === 'Very High') {
      return sum + (side.percent[i] ?? 0);
    }
    return sum;
  }, 0);
}

function workforceElevatedPercent(item: ApiCampDashboardDiseaseGenderItem): number {
  const maleTotal = genderHeadcount(item.male);
  const femaleTotal = genderHeadcount(item.female);
  const total = maleTotal + femaleTotal;
  if (total === 0) return 0;

  const maleElevated = sideElevatedPercent(item.male);
  const femaleElevated = sideElevatedPercent(item.female);
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
    count: side.count[i] ?? 0,
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
  const enrolled = api.employees_enrolled ?? 0;
  const doctor =
    api.doctor_consultation ?? api.consultations?.doctor ?? 0;
  const nutritionist =
    api.nutritionist_consultation ?? api.consultations?.nutritionist ?? 0;
  const doctorAndNutritionist =
    api.doctor_and_nutritionist_consultation ??
    api.consultations?.doctor_nutritionist ??
    0;
  const bioAi = api.bio_ai_report_generated ?? 0;
  const bioAiPercent =
    enrolled > 0 ? Math.round((bioAi / enrolled) * 100) : undefined;

  return {
    employeesEnrolled: enrolled,
    maleEnrolled: api.male_enrolled,
    femaleEnrolled: api.female_enrolled,
    totalBloodTest: api.total_blood_test,
    bloodTestPercent: api.blood_test_percent,
    totalBioAiReports: bioAi,
    bioAiPercent,
    questionnaireCompleted: api.questionnaire_completed,
    doctorConsultation: doctor,
    nutritionistConsultation: nutritionist,
    doctorAndNutritionistConsultation: doctorAndNutritionist,
    highRiskGroup: api.high_risk_group ?? 0,
    cautionRiskGroup: api.caution_risk_group ?? 0,
    goodRiskGroup: api.good_risk_group ?? 0,
  };
}

/** Build metabolic age buckets from KPI risk-group counts. */
export function metabolicCategoriesFromKpis(kpis: KpiSummary | null | undefined): {
  key: 'good' | 'attention' | 'highRisk';
  label: string;
  count: number;
  percent: number;
}[] {
  if (!kpis) return [];

  const good = kpis.goodRiskGroup ?? 0;
  const caution = kpis.cautionRiskGroup ?? 0;
  const high = kpis.highRiskGroup ?? 0;
  const total = good + caution + high;
  if (total <= 0) return [];

  const pct = (count: number) => Math.round((count / total) * 100);

  return [
    { key: 'good', label: 'GOOD', count: good, percent: pct(good) },
    { key: 'attention', label: 'NEEDS ATTENTION', count: caution, percent: pct(caution) },
    { key: 'highRisk', label: 'HIGH RISK', count: high, percent: pct(high) },
  ];
}

export function mapCampRanking(api: ApiCampDashboardRanking): RankingSummary | null {
  const entry = Object.entries(api ?? {}).find(
    ([, value]) => value != null && typeof value.rank === 'number',
  );
  if (!entry) return null;
  const [city, ranks] = entry;
  return {
    city,
    cityRank: ranks.rank,
    industryRank: ranks.industry_rank,
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
  const ranked = [...items]
    .filter((item) => !DEEP_DIVE_EXCLUDED_CODES.has(item.code))
    .map((item) => ({
      item,
      highRiskPercent: workforceElevatedPercent(item),
    }))
    .sort((a, b) => b.highRiskPercent - a.highRiskPercent);

  const topHighRiskDiseases = ranked.slice(0, 3).map(({ item, highRiskPercent }) => ({
    name: diseaseDefinitionForCode(item.code).name,
    highRiskPercent,
  }));

  const diseases = ranked.map(({ item }) => mapDiseaseGenderItem(item));

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

const BLOOD_LAB_PANEL_SPECS = [
  {
    id: 'b12',
    name: 'Vitamin B12',
    profile: 'vitamin_profile' as const,
    apiKey: 'vitamin_b12',
  },
  {
    id: 'd3',
    name: 'Vitamin D3',
    profile: 'vitamin_profile' as const,
    apiKey: 'vitamin_d_total-25_hydroxy',
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    profile: 'diabetes_profile' as const,
    apiKey: 'hba1c',
  },
  {
    id: 'lipid',
    name: 'Lipid',
    profile: 'lipid_profile' as const,
    apiKey: 'cholesterol_total__triglycerides__ldl_cholestrol',
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory',
    profile: 'inflammatory' as const,
    apiKey: 'homocysteine__hs-crp__esr',
  },
] as const;

export function mapCampBloodAndLabIntelligence(
  api: ApiCampDashboardBloodAndLabIntelligence,
): BloodParameterPanel[] {
  return BLOOD_LAB_PANEL_SPECS.map(({ id, name, profile, apiKey }) => {
    const inRangePercent = Math.round(api[profile]?.[apiKey]?.in_range_percent ?? 0);
    const abnormalPercent = Math.max(0, 100 - inRangePercent);
    return { id, name, inRangePercent, abnormalPercent };
  });
}
