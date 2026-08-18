/**
 * TEMPORARY DUMMY DATA — All Years dashboard views + per-year snapshots.
 * Delete this file (and its imports) when multi-year API is wired.
 */
import type {
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  RankingSummary,
} from '../types';
import type { YearOption } from '../components/layout/DashboardHeader';

export type MetabolicAgeCategoryDummy = {
  key: 'good' | 'attention' | 'highRisk';
  label: string;
  count: number;
  percent: number;
};

/**
 * Canonical per-year KPI totals — All Years cards and single-year views both read from this.
 * Order for series arrays is always 2024 → 2025 → 2026.
 */
const YEAR_KPI_CORE = {
  2024: {
    employeesEnrolled: 620,
    bloodTestPercent: 88,
    bioAiPercent: 72,
    doctorRate: 0.32,
    maleShare: 0.58,
    highRiskGroup: 93,
  },
  2025: {
    employeesEnrolled: 900,
    bloodTestPercent: 91,
    bioAiPercent: 78,
    doctorRate: 0.4,
    maleShare: 0.56,
    highRiskGroup: 90,
  },
  2026: {
    employeesEnrolled: 1120,
    bloodTestPercent: 94,
    bioAiPercent: 85,
    doctorRate: 0.48,
    maleShare: 0.54,
    highRiskGroup: 56,
  },
} as const;

function buildYearKpi(year: 2024 | 2025 | 2026): KpiSummary {
  const core = YEAR_KPI_CORE[year];
  const enrolled = core.employeesEnrolled;
  const blood = Math.round((enrolled * core.bloodTestPercent) / 100);
  const bio = Math.round((enrolled * core.bioAiPercent) / 100);
  const doctor = Math.round(enrolled * core.doctorRate);
  const male = Math.round(enrolled * core.maleShare);
  return {
    employeesEnrolled: enrolled,
    maleEnrolled: male,
    femaleEnrolled: enrolled - male,
    totalBloodTest: blood,
    bloodTestPercent: core.bloodTestPercent,
    totalBioAiReports: bio,
    bioAiPercent: core.bioAiPercent,
    doctorConsultation: doctor,
    nutritionistConsultation: Math.round(doctor * 0.75),
    highRiskGroup: core.highRiskGroup,
  };
}

const KPI_2024 = buildYearKpi(2024);
const KPI_2025 = buildYearKpi(2025);
const KPI_2026 = buildYearKpi(2026);

/** Rankings: improving toward ~10 by 2026. Index 0=2024, 1=2025, 2=2026. */
export const DUMMY_ALL_YEARS_METRICS = {
  years: [2024, 2025, 2026] as const,
  nationalRank: [14, 11, 9] as const,
  industryRank: [12, 10, 8] as const,
  employees: [
    KPI_2024.employeesEnrolled,
    KPI_2025.employeesEnrolled,
    KPI_2026.employeesEnrolled,
  ] as const,
  bloodTests: [
    KPI_2024.totalBloodTest,
    KPI_2025.totalBloodTest,
    KPI_2026.totalBloodTest,
  ] as const,
  bioAiReports: [
    KPI_2024.totalBioAiReports ?? 0,
    KPI_2025.totalBioAiReports ?? 0,
    KPI_2026.totalBioAiReports ?? 0,
  ] as const,
  /** Doctor consultations — matches the doctor side of single-year Doctor/Nutritionist. */
  consultations: [
    KPI_2024.doctorConsultation,
    KPI_2025.doctorConsultation,
    KPI_2026.doctorConsultation,
  ] as const,
} as const;

/** Age bands shared by All Years participation pies. */
export const DUMMY_AGE_BANDS = ['18-25', '26-35', '36-45', '46-55', '55+'] as const;

/**
 * TEMPORARY — Age-wise participation by year (newest → oldest for display order).
 * Percents should sum ~100 per year; assessed = sum of enrolled.
 */
export const DUMMY_ALL_YEARS_AGE_PARTICIPATION = [
  {
    year: 2026,
    assessed: 1120,
    bands: [
      { ageGroup: '18-25', percent: 12, enrolled: 134 },
      { ageGroup: '26-35', percent: 22, enrolled: 246 },
      { ageGroup: '36-45', percent: 34, enrolled: 381 },
      { ageGroup: '46-55', percent: 20, enrolled: 224 },
      { ageGroup: '55+', percent: 12, enrolled: 135 },
    ],
  },
  {
    year: 2025,
    assessed: 900,
    bands: [
      { ageGroup: '18-25', percent: 14, enrolled: 126 },
      { ageGroup: '26-35', percent: 24, enrolled: 216 },
      { ageGroup: '36-45', percent: 32, enrolled: 288 },
      { ageGroup: '46-55', percent: 18, enrolled: 162 },
      { ageGroup: '55+', percent: 12, enrolled: 108 },
    ],
  },
  {
    year: 2024,
    assessed: 620,
    bands: [
      { ageGroup: '18-25', percent: 15, enrolled: 93 },
      { ageGroup: '26-35', percent: 25, enrolled: 155 },
      { ageGroup: '36-45', percent: 30, enrolled: 186 },
      { ageGroup: '46-55', percent: 18, enrolled: 112 },
      { ageGroup: '55+', percent: 12, enrolled: 74 },
    ],
  },
] as const;

/** Insight copy for All Years age participation (dummy) — mirrors 2026 row. */
export const DUMMY_ALL_YEARS_AGE_INSIGHT =
  '36-45 is the largest cohort at 34% (381 employees) — tailor camp messaging and scheduling for under-represented age bands.';

/**
 * TEMPORARY — Metabolic age stacked bars for All Years (newest → oldest).
 * Percents: good + caution + highRisk ≈ 100.
 */
export const DUMMY_ALL_YEARS_METABOLIC_AGE = [
  { year: 2026, good: 45, caution: 40, highRisk: 15 },
  { year: 2025, good: 35, caution: 40, highRisk: 25 },
  { year: 2024, good: 15, caution: 40, highRisk: 45 },
] as const;

export const DUMMY_ALL_YEARS_METABOLIC_INSIGHT =
  '15% of employees have their metabolic age >3 years above their actual age';

/**
 * TEMPORARY — Overall risk score by year (newest → oldest).
 * Bands: Optimal, Low risk, Increased Risk, High risk.
 */
export const DUMMY_ALL_YEARS_OVERALL_RISK = [
  {
    year: 2026,
    assessed: 1120,
    bands: [
      { band: 'Optimal', percent: 25, count: 280 },
      { band: 'Low risk', percent: 50, count: 560 },
      { band: 'Increased Risk', percent: 20, count: 224 },
      { band: 'High risk', percent: 5, count: 56 },
    ],
  },
  {
    year: 2025,
    assessed: 900,
    bands: [
      { band: 'Optimal', percent: 22, count: 198 },
      { band: 'Low risk', percent: 45, count: 405 },
      { band: 'Increased Risk', percent: 23, count: 207 },
      { band: 'High risk', percent: 10, count: 90 },
    ],
  },
  {
    year: 2024,
    assessed: 620,
    bands: [
      { band: 'Optimal', percent: 18, count: 112 },
      { band: 'Low risk', percent: 42, count: 260 },
      { band: 'Increased Risk', percent: 25, count: 155 },
      { band: 'High risk', percent: 15, count: 93 },
    ],
  },
] as const;

export const DUMMY_ALL_YEARS_OVERALL_RISK_CONCERN =
  'Moderate health concern. 25% of employees fall within the Increased Risk or High Risk bands. Targeted lifestyle interventions, personalized wellness programs, and doctor consultations are recommended to prevent progression to chronic health conditions.';

/** TEMPORARY — Camp Report Executive Ranking (map cities + among counts). */
export const DUMMY_EXECUTIVE_RANKING = {
  nationalRank: 9,
  nationalAmong: 38,
  nationalAmongLabel: 'Among 38 companies in region',
  industryRank: 8,
  industryAmong: 12,
  industryAmongLabel: 'Among 12 companies',
  cities: [
    { name: 'GURUGRAM', rank: 11, tone: 'red', top: '24%', left: '36%' },
    { name: 'PUNE', rank: 10, tone: 'blue', top: '46%', left: '4%' },
    { name: 'HYDERABAD', rank: 9, tone: 'pink', top: '58%', left: '48%' },
    { name: 'BANGALORE', rank: 7, tone: 'teal', top: '74%', left: '22%' },
  ],
} as const;

export type CampYear = 2024 | 2025 | 2026;

export function parseCampYear(year: YearOption | string | undefined): CampYear | null {
  if (year === '2024' || year === '2025' || year === '2026') return Number(year) as CampYear;
  return null;
}

function yearMetricsIndex(year: CampYear): 0 | 1 | 2 {
  return (year - 2024) as 0 | 1 | 2;
}

function ageRow(year: CampYear) {
  const row = DUMMY_ALL_YEARS_AGE_PARTICIPATION.find((r) => r.year === year);
  if (!row) throw new Error(`Missing age participation for ${year}`);
  return row;
}

function riskRow(year: CampYear) {
  const row = DUMMY_ALL_YEARS_OVERALL_RISK.find((r) => r.year === year);
  if (!row) throw new Error(`Missing overall risk for ${year}`);
  return row;
}

function metabolicRow(year: CampYear) {
  const row = DUMMY_ALL_YEARS_METABOLIC_AGE.find((r) => r.year === year);
  if (!row) throw new Error(`Missing metabolic age for ${year}`);
  return row;
}

/** Distinct dummy KPIs per camp year — identical to All Years metric card values. */
export function getDummyYearKpis(year: CampYear): KpiSummary {
  if (year === 2024) return { ...KPI_2024 };
  if (year === 2025) return { ...KPI_2025 };
  return { ...KPI_2026 };
}

export function getDummyYearRanking(year: CampYear): RankingSummary {
  const i = yearMetricsIndex(year);
  return {
    city: 'Mumbai',
    cityRank: DUMMY_ALL_YEARS_METRICS.nationalRank[i],
    industryRank: DUMMY_ALL_YEARS_METRICS.industryRank[i],
  };
}

export function getDummyYearExecutiveRanking(year: CampYear) {
  const i = yearMetricsIndex(year);
  const nationalRank = DUMMY_ALL_YEARS_METRICS.nationalRank[i];
  const industryRank = DUMMY_ALL_YEARS_METRICS.industryRank[i];
  // Keep city pins near ~10 and consistent with national improvement.
  const cityBump = [3, 1, 0][i];
  return {
    nationalRank,
    nationalAmong: DUMMY_EXECUTIVE_RANKING.nationalAmong,
    nationalAmongLabel: DUMMY_EXECUTIVE_RANKING.nationalAmongLabel,
    industryRank,
    industryAmong: DUMMY_EXECUTIVE_RANKING.industryAmong,
    industryAmongLabel: DUMMY_EXECUTIVE_RANKING.industryAmongLabel,
    cities: DUMMY_EXECUTIVE_RANKING.cities.map((city) => ({
      ...city,
      rank: Math.max(1, city.rank + cityBump),
    })),
  };
}

export function getDummyYearParticipationByAge(year: CampYear): ParticipationByAge[] {
  return ageRow(year).bands.map((band) => ({
    ageGroup: band.ageGroup,
    enrolled: band.enrolled,
    percent: band.percent,
  }));
}

export function getDummyYearOverallRisk(year: CampYear): OverallRiskScoreBucket[] {
  return riskRow(year).bands.map((band) => ({
    band: band.band as OverallRiskScoreBucket['band'],
    percent: band.percent,
    count: band.count,
  }));
}

export function getDummyYearMetabolicAge(year: CampYear): MetabolicAgeCategoryDummy[] {
  const row = metabolicRow(year);
  const enrolled = ageRow(year).assessed;
  return [
    {
      key: 'good',
      label: 'GOOD',
      percent: row.good,
      count: Math.round((row.good / 100) * enrolled),
    },
    {
      key: 'attention',
      label: 'NEEDS ATTENTION',
      percent: row.caution,
      count: Math.round((row.caution / 100) * enrolled),
    },
    {
      key: 'highRisk',
      label: 'HIGH RISK',
      percent: row.highRisk,
      count: Math.round((row.highRisk / 100) * enrolled),
    },
  ];
}
