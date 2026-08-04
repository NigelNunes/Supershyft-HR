/**
 * TEMPORARY DUMMY DATA — All Years dashboard views + per-year snapshots.
 * Delete this file (and its imports) when multi-year API is wired.
 */
import type {
  BloodParameterPanel,
  CompanyAverageScores,
  DiseaseRiskData,
  GenderDistributionPair,
  KpiSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  RankingSummary,
  RiskLevel,
  TopHighRiskDisease,
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

/**
 * TEMPORARY — Company average scores by year (All Years Camp Report).
 * Bar colors follow risk bands: ≤24 High · 25–49 Increased · 50–67.5 Low · >67.5 Optimal.
 */
export const DUMMY_ALL_YEARS_COMPANY_SCORES = {
  years: [2024, 2025, 2026] as const,
  nutrition: [24, 55, 79] as const,
  fitness: [24, 55, 79] as const,
  lifestyle: [24, 55, 79] as const,
  /** Design copy for All Years cards until API provides YoY deltas. */
  improvementPercent: 28,
} as const;

export type AllYearsLifestyleYearRow = {
  year: number;
  /** Highlight metric shown beside the year (design placeholder until API). */
  highlight: number;
  slices: { label: string; percent: number }[];
};

/**
 * TEMPORARY — Physical activity / sleep by year × gender (All Years Camp Report).
 * Years newest → oldest to match Figma row order.
 */
export const DUMMY_ALL_YEARS_PHYSICAL = {
  male: [
    {
      year: 2026,
      highlight: 46,
      slices: [
        { label: 'Less than 30mins', percent: 28 },
        { label: '30-60mins', percent: 32 },
        { label: 'More than 60 mins', percent: 22 },
        { label: 'Rarely or Never', percent: 18 },
      ],
    },
    {
      year: 2025,
      highlight: 42,
      slices: [
        { label: 'Less than 30mins', percent: 22 },
        { label: '30-60mins', percent: 35 },
        { label: 'More than 60 mins', percent: 25 },
        { label: 'Rarely or Never', percent: 18 },
      ],
    },
    {
      year: 2024,
      highlight: 36,
      slices: [
        { label: 'Less than 30mins', percent: 16 },
        { label: '30-60mins', percent: 30 },
        { label: 'More than 60 mins', percent: 36 },
        { label: 'Rarely or Never', percent: 18 },
      ],
    },
  ] satisfies AllYearsLifestyleYearRow[],
  female: [
    {
      year: 2026,
      highlight: 38,
      slices: [
        { label: 'Less than 30mins', percent: 22 },
        { label: '30-60mins', percent: 28 },
        { label: 'More than 60 mins', percent: 28 },
        { label: 'Rarely or Never', percent: 22 },
      ],
    },
    {
      year: 2025,
      highlight: 42,
      slices: [
        { label: 'Less than 30mins', percent: 28 },
        { label: '30-60mins', percent: 30 },
        { label: 'More than 60 mins', percent: 24 },
        { label: 'Rarely or Never', percent: 18 },
      ],
    },
    {
      year: 2024,
      highlight: 32,
      slices: [
        { label: 'Less than 30mins', percent: 22 },
        { label: '30-60mins', percent: 38 },
        { label: 'More than 60 mins', percent: 18 },
        { label: 'Rarely or Never', percent: 22 },
      ],
    },
  ] satisfies AllYearsLifestyleYearRow[],
} as const;

export const DUMMY_ALL_YEARS_SLEEP = {
  male: [
    {
      year: 2026,
      highlight: 46,
      slices: [
        { label: 'Less than 5', percent: 12 },
        { label: '5-7', percent: 48 },
        { label: '7-9', percent: 28 },
        { label: 'More than 9', percent: 12 },
      ],
    },
    {
      year: 2025,
      highlight: 42,
      slices: [
        { label: 'Less than 5', percent: 16 },
        { label: '5-7', percent: 38 },
        { label: '7-9', percent: 28 },
        { label: 'More than 9', percent: 18 },
      ],
    },
    {
      year: 2024,
      highlight: 36,
      slices: [
        { label: 'Less than 5', percent: 14 },
        { label: '5-7', percent: 28 },
        { label: '7-9', percent: 30 },
        { label: 'More than 9', percent: 28 },
      ],
    },
  ] satisfies AllYearsLifestyleYearRow[],
  female: [
    {
      year: 2026,
      highlight: 38,
      slices: [
        { label: 'Less than 5', percent: 10 },
        { label: '5-7', percent: 52 },
        { label: '7-9', percent: 26 },
        { label: 'More than 9', percent: 12 },
      ],
    },
    {
      year: 2025,
      highlight: 42,
      slices: [
        { label: 'Less than 5', percent: 40 },
        { label: '5-7', percent: 38 },
        { label: '7-9', percent: 14 },
        { label: 'More than 9', percent: 8 },
      ],
    },
    {
      year: 2024,
      highlight: 32,
      slices: [
        { label: 'Less than 5', percent: 12 },
        { label: '5-7', percent: 22 },
        { label: '7-9', percent: 36 },
        { label: 'More than 9', percent: 30 },
      ],
    },
  ] satisfies AllYearsLifestyleYearRow[],
} as const;

/**
 * TEMPORARY — Top disease risk lead per year (All Years Camp Report).
 * Newest → oldest; colors match year legend.
 */
export const DUMMY_ALL_YEARS_TOP_DISEASE_RISKS = [
  { year: 2026, name: 'Obesity', highRiskPercent: 21.1, color: '#B760FF' },
  { year: 2025, name: 'Dyslipidemia', highRiskPercent: 36.5, color: '#4A45D3' },
  { year: 2024, name: 'NAFLD', highRiskPercent: 32.6, color: '#0E0EA8' },
] as const;

/**
 * TEMPORARY — Disease deep dive risk bands by year × gender (All Years Camp Report).
 * Values are % shares for Healthy / Increased / High / Very High (sum ≈ 100 per year).
 * Years ordered oldest → newest: 2024, 2025, 2026.
 */
export type AllYearsDiseaseRiskBand = 'Healthy' | 'Increased' | 'High' | 'Very High';

export type AllYearsDiseaseGenderSeries = Record<
  AllYearsDiseaseRiskBand,
  readonly [number, number, number]
>;

export interface AllYearsDiseaseDeepDiveRow {
  code: string;
  name: string;
  male: AllYearsDiseaseGenderSeries;
  female: AllYearsDiseaseGenderSeries;
}

const baseBands = (
  healthy: readonly [number, number, number],
  increased: readonly [number, number, number],
  high: readonly [number, number, number],
  veryHigh: readonly [number, number, number],
): AllYearsDiseaseGenderSeries => ({
  Healthy: healthy,
  Increased: increased,
  High: high,
  'Very High': veryHigh,
});

/** Figma sample series used as the Type 2 Diabetes / shared template. */
const SAMPLE_SERIES = baseBands(
  [62, 65, 68],
  [22, 21, 19],
  [11, 10, 9],
  [5, 4, 4],
);

function shiftSeries(
  series: AllYearsDiseaseGenderSeries,
  delta: number,
): AllYearsDiseaseGenderSeries {
  const clamp = (n: number) => Math.max(1, Math.min(90, Math.round(n)));
  const shift = (values: readonly [number, number, number], d: number) =>
    [clamp(values[0] + d), clamp(values[1] + d), clamp(values[2] + d)] as const;
  return {
    Healthy: shift(series.Healthy, delta),
    Increased: shift(series.Increased, -Math.round(delta / 2)),
    High: shift(series.High, -Math.round(delta / 3)),
    'Very High': shift(series['Very High'], -Math.round(delta / 4)),
  };
}

export const DUMMY_ALL_YEARS_DISEASE_YEARS = [2024, 2025, 2026] as const;

export const DUMMY_ALL_YEARS_DISEASE_DEEP_DIVE: AllYearsDiseaseDeepDiveRow[] = [
  {
    code: 'nafld',
    name: 'NAFLD',
    male: shiftSeries(SAMPLE_SERIES, -4),
    female: shiftSeries(SAMPLE_SERIES, -2),
  },
  {
    code: 'type_2_diabetes',
    name: 'Type 2 Diabetes',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  {
    code: 'cardiac_health',
    name: 'Cardiac Health',
    male: shiftSeries(SAMPLE_SERIES, -1),
    female: shiftSeries(SAMPLE_SERIES, 1),
  },
  {
    code: 'hypertension',
    name: 'Hypertension',
    male: shiftSeries(SAMPLE_SERIES, -3),
    female: shiftSeries(SAMPLE_SERIES, -1),
  },
  {
    code: 'thyroid_health',
    name: 'Thyroid Health',
    male: shiftSeries(SAMPLE_SERIES, 2),
    female: shiftSeries(SAMPLE_SERIES, 3),
  },
  {
    code: 'obesity',
    name: 'Obesity',
    male: shiftSeries(SAMPLE_SERIES, -6),
    female: shiftSeries(SAMPLE_SERIES, -5),
  },
  {
    code: 'dyslipidemia',
    name: 'Dyslipidemia',
    male: shiftSeries(SAMPLE_SERIES, -8),
    female: shiftSeries(SAMPLE_SERIES, -7),
  },
  {
    code: 'pcos_pcod',
    name: 'PCOS/PCOD',
    male: shiftSeries(SAMPLE_SERIES, 4),
    female: shiftSeries(SAMPLE_SERIES, -3),
  },
];

/**
 * TEMPORARY — Blood & lab in-range dots by year (All Years Camp Report).
 * 10 dots per year (2×5), lit from the bottom. Years match Figma: 2023–2025.
 */
export const DUMMY_ALL_YEARS_BLOOD_PANELS = [
  {
    id: 'b12',
    name: 'Vitamin B12',
    years: [
      { year: 2023, lit: 5 },
      { year: 2024, lit: 7 },
      { year: 2025, lit: 8 },
    ],
    deltaPercent: 7,
  },
  {
    id: 'd3',
    name: 'Vitamin D3',
    years: [
      { year: 2023, lit: 5 },
      { year: 2024, lit: 5 },
      { year: 2025, lit: 4 },
    ],
    deltaPercent: -6,
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    years: [
      { year: 2023, lit: 5 },
      { year: 2024, lit: 7 },
      { year: 2025, lit: 8 },
    ],
    deltaPercent: 7,
  },
  {
    id: 'lipid',
    name: 'Lipid',
    years: [
      { year: 2023, lit: 5 },
      { year: 2024, lit: 7 },
      { year: 2025, lit: 8 },
    ],
    deltaPercent: 7,
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory',
    years: [
      { year: 2023, lit: 5 },
      { year: 2024, lit: 5 },
      { year: 2025, lit: 4 },
    ],
    deltaPercent: -6,
  },
] as const;

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

function lifestyleToPair(
  rows: readonly AllYearsLifestyleYearRow[],
  year: CampYear,
  enrolled: number,
): { label: string; percent: number; count: number }[] {
  const row = rows.find((r) => r.year === year);
  if (!row) return [];
  return row.slices.map((slice) => ({
    label: slice.label,
    percent: slice.percent,
    count: Math.round((slice.percent / 100) * enrolled),
  }));
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

export function getDummyYearCompanyScores(year: CampYear): CompanyAverageScores {
  const i = yearMetricsIndex(year);
  return {
    nutrition: DUMMY_ALL_YEARS_COMPANY_SCORES.nutrition[i],
    fitness: DUMMY_ALL_YEARS_COMPANY_SCORES.fitness[i],
    lifestyle: DUMMY_ALL_YEARS_COMPANY_SCORES.lifestyle[i],
  };
}

export function getDummyYearPhysicalActivity(year: CampYear): GenderDistributionPair {
  const kpis = getDummyYearKpis(year);
  const maleN = kpis.maleEnrolled ?? Math.round(kpis.employeesEnrolled * 0.55);
  const femaleN = kpis.femaleEnrolled ?? kpis.employeesEnrolled - maleN;
  return {
    male: lifestyleToPair(DUMMY_ALL_YEARS_PHYSICAL.male, year, maleN),
    female: lifestyleToPair(DUMMY_ALL_YEARS_PHYSICAL.female, year, femaleN),
  };
}

export function getDummyYearSleep(year: CampYear): GenderDistributionPair {
  const kpis = getDummyYearKpis(year);
  const maleN = kpis.maleEnrolled ?? Math.round(kpis.employeesEnrolled * 0.55);
  const femaleN = kpis.femaleEnrolled ?? kpis.employeesEnrolled - maleN;
  return {
    male: lifestyleToPair(DUMMY_ALL_YEARS_SLEEP.male, year, maleN),
    female: lifestyleToPair(DUMMY_ALL_YEARS_SLEEP.female, year, femaleN),
  };
}

const YEAR_BLOOD_BASE: { id: string; name: string; base: number }[] = [
  { id: 'b12', name: 'Vitamin B12', base: 66 },
  { id: 'd3', name: 'Vitamin D', base: 59 },
  { id: 'hba1c', name: 'HbA1c', base: 78 },
  { id: 'ldl', name: 'LDL Cholesterol', base: 71 },
  { id: 'tsh', name: 'TSH', base: 82 },
];

export function getDummyYearBloodPanels(year: CampYear): BloodParameterPanel[] {
  const bump = { 2024: -8, 2025: -3, 2026: 0 }[year];
  return YEAR_BLOOD_BASE.map((panel) => {
    const inRangePercent = Math.max(35, Math.min(95, panel.base + bump));
    return {
      id: panel.id,
      name: panel.name,
      inRangePercent,
      abnormalPercent: 100 - inRangePercent,
    };
  });
}

export function getDummyYearTopDiseases(year: CampYear): TopHighRiskDisease[] {
  const lead = DUMMY_ALL_YEARS_TOP_DISEASE_RISKS.find((d) => d.year === year);
  const others = DUMMY_ALL_YEARS_TOP_DISEASE_RISKS.filter((d) => d.year !== year);
  const list = lead ? [lead, ...others] : [...DUMMY_ALL_YEARS_TOP_DISEASE_RISKS];
  const scale = { 2024: 1.15, 2025: 1.05, 2026: 1 }[year];
  return list.slice(0, 3).map((d, idx) => ({
    name: d.name,
    highRiskPercent: Math.round(d.highRiskPercent * scale * (1 - idx * 0.08) * 10) / 10,
  }));
}

export function getDummyYearDiseases(year: CampYear): DiseaseRiskData[] {
  const yi = yearMetricsIndex(year);
  const levels: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];

  return DUMMY_ALL_YEARS_DISEASE_DEEP_DIVE.map((row) => {
    const buckets = levels.map((level) => ({
      level,
      segments: {
        Male: row.male[level][yi],
        Female: row.female[level][yi],
      },
    }));
    const healthyAvg = (buckets[0].segments.Male + buckets[0].segments.Female) / 2;
    const overallStatus: RiskLevel =
      healthyAvg >= 70 ? 'Healthy' : healthyAvg >= 55 ? 'Increased' : healthyAvg >= 40 ? 'High' : 'Very High';
    return {
      disease: { code: row.code as DiseaseRiskData['disease']['code'], name: row.name },
      buckets,
      overallStatus,
    };
  });
}
