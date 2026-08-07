/**
 * TEMPORARY DUMMY DATA — All Years dashboard views.
 * Delete this file (and its imports) when multi-year API is wired.
 */
export const DUMMY_ALL_YEARS_METRICS = {
  years: [2024, 2025, 2026] as const,
  nationalRank: [999, 999, 999] as const,
  industryRank: [999, 999, 999] as const,
  employees: [999, 999, 999] as const,
  bloodTests: [999, 999, 999] as const,
  bioAiReports: [999, 999, 999] as const,
  consultations: [999, 999, 999] as const,
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
    assessed: 999,
    bands: [
      { ageGroup: '18-25', percent: 999, enrolled: 999 },
      { ageGroup: '26-35', percent: 999, enrolled: 999 },
      { ageGroup: '36-45', percent: 999, enrolled: 999 },
      { ageGroup: '46-55', percent: 999, enrolled: 999 },
      { ageGroup: '55+', percent: 999, enrolled: 999 },
    ],
  },
  {
    year: 2025,
    assessed: 999,
    bands: [
      { ageGroup: '18-25', percent: 999, enrolled: 999 },
      { ageGroup: '26-35', percent: 999, enrolled: 999 },
      { ageGroup: '36-45', percent: 999, enrolled: 999 },
      { ageGroup: '46-55', percent: 999, enrolled: 999 },
      { ageGroup: '55+', percent: 999, enrolled: 999 },
    ],
  },
  {
    year: 2024,
    assessed: 999,
    bands: [
      { ageGroup: '18-25', percent: 999, enrolled: 999 },
      { ageGroup: '26-35', percent: 999, enrolled: 999 },
      { ageGroup: '36-45', percent: 999, enrolled: 999 },
      { ageGroup: '46-55', percent: 999, enrolled: 999 },
      { ageGroup: '55+', percent: 999, enrolled: 999 },
    ],
  },
] as const;

/** Insight copy for All Years age participation (dummy). */
export const DUMMY_ALL_YEARS_AGE_INSIGHT =
  '36-45 is the largest cohort at 999% (999 employees) — tailor camp messaging and scheduling for under-represented age bands.';

/**
 * TEMPORARY — Metabolic age stacked bars for All Years (newest → oldest).
 * Percents: good + caution + highRisk ≈ 100.
 */
export const DUMMY_ALL_YEARS_METABOLIC_AGE = [
  { year: 2026, good: 999, caution: 999, highRisk: 999 },
  { year: 2025, good: 999, caution: 999, highRisk: 999 },
  { year: 2024, good: 999, caution: 999, highRisk: 999 },
] as const;

export const DUMMY_ALL_YEARS_METABOLIC_INSIGHT =
  '999% Employees have their metabolic age >3 years of their actual age';

/**
 * TEMPORARY — Overall risk score by year (newest → oldest).
 * Bands: Optimal, Low risk, Increased Risk, High risk.
 */
export const DUMMY_ALL_YEARS_OVERALL_RISK = [
  {
    year: 2026,
    assessed: 999,
    bands: [
      { band: 'Optimal', percent: 999, count: 999 },
      { band: 'Low risk', percent: 999, count: 999 },
      { band: 'Increased Risk', percent: 999, count: 999 },
      { band: 'High risk', percent: 999, count: 999 },
    ],
  },
  {
    year: 2025,
    assessed: 999,
    bands: [
      { band: 'Optimal', percent: 999, count: 999 },
      { band: 'Low risk', percent: 999, count: 999 },
      { band: 'Increased Risk', percent: 999, count: 999 },
      { band: 'High risk', percent: 999, count: 999 },
    ],
  },
  {
    year: 2024,
    assessed: 999,
    bands: [
      { band: 'Optimal', percent: 999, count: 999 },
      { band: 'Low risk', percent: 999, count: 999 },
      { band: 'Increased Risk', percent: 999, count: 999 },
      { band: 'High risk', percent: 999, count: 999 },
    ],
  },
] as const;

export const DUMMY_ALL_YEARS_OVERALL_RISK_CONCERN =
  'Moderate health concern. 999% of employees fall within the Increased Risk or High Risk bands. Targeted lifestyle interventions, personalized wellness programs, and doctor consultations are recommended to prevent progression to chronic health conditions.';

/** TEMPORARY — Camp Report Executive Ranking (map cities + among counts). */
export const DUMMY_EXECUTIVE_RANKING = {
  nationalRank: 999,
  nationalAmong: 999,
  nationalAmongLabel: 'Among 999 companies in region',
  industryRank: 999,
  industryAmong: 999,
  industryAmongLabel: 'Among 999 companies',
  cities: [
    { name: 'GURUGRAM', rank: 999, tone: 'red', top: '24%', left: '36%' },
    { name: 'PUNE', rank: 999, tone: 'blue', top: '46%', left: '4%' },
    { name: 'HYDERABAD', rank: 999, tone: 'pink', top: '58%', left: '48%' },
    { name: 'BANGALORE', rank: 999, tone: 'teal', top: '74%', left: '22%' },
  ],
} as const;

/**
 * TEMPORARY — Company average scores by year (All Years Camp Report).
 * Bar colors follow risk bands: ≤24 High · 25–49 Increased · 50–67.5 Low · >67.5 Optimal.
 */
export const DUMMY_ALL_YEARS_COMPANY_SCORES = {
  years: [2024, 2025, 2026] as const,
  nutrition: [999, 999, 999] as const,
  fitness: [999, 999, 999] as const,
  lifestyle: [999, 999, 999] as const,
  /** Design copy for All Years cards until API provides YoY deltas. */
  improvementPercent: 999,
} as const;

export type AllYearsLifestyleYearRow = {
  year: number;
  /** Highlight metric shown beside the year (design placeholder until API). */
  highlight: number;
  slices: { label: string; percent: number }[];
};

const DUMMY_PHYSICAL_SLICES = [
  { label: 'Less than 30mins', percent: 999 },
  { label: '30-60mins', percent: 999 },
  { label: 'More than 60 mins', percent: 999 },
  { label: 'Rarely or Never', percent: 999 },
];

const DUMMY_SLEEP_SLICES = [
  { label: 'Less than 5', percent: 999 },
  { label: '5-7', percent: 999 },
  { label: '7-9', percent: 999 },
  { label: 'More than 9', percent: 999 },
];

/**
 * TEMPORARY — Physical activity / sleep by year × gender (All Years Camp Report).
 * Years newest → oldest to match Figma row order.
 */
export const DUMMY_ALL_YEARS_PHYSICAL = {
  male: [
    { year: 2026, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
    { year: 2025, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
    { year: 2024, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
  ] satisfies AllYearsLifestyleYearRow[],
  female: [
    { year: 2026, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
    { year: 2025, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
    { year: 2024, highlight: 999, slices: DUMMY_PHYSICAL_SLICES },
  ] satisfies AllYearsLifestyleYearRow[],
} as const;

export const DUMMY_ALL_YEARS_SLEEP = {
  male: [
    { year: 2026, highlight: 999, slices: DUMMY_SLEEP_SLICES },
    { year: 2025, highlight: 999, slices: DUMMY_SLEEP_SLICES },
    { year: 2024, highlight: 999, slices: DUMMY_SLEEP_SLICES },
  ] satisfies AllYearsLifestyleYearRow[],
  female: [
    { year: 2026, highlight: 999, slices: DUMMY_SLEEP_SLICES },
    { year: 2025, highlight: 999, slices: DUMMY_SLEEP_SLICES },
    { year: 2024, highlight: 999, slices: DUMMY_SLEEP_SLICES },
  ] satisfies AllYearsLifestyleYearRow[],
} as const;

/**
 * TEMPORARY — Top disease risk lead per year (All Years Camp Report).
 * Newest → oldest; colors match year legend.
 */
export const DUMMY_ALL_YEARS_TOP_DISEASE_RISKS = [
  { year: 2026, name: 'Obesity', highRiskPercent: 999, color: '#B760FF' },
  { year: 2025, name: 'Dyslipidemia', highRiskPercent: 999, color: '#4A45D3' },
  { year: 2024, name: 'NAFLD', highRiskPercent: 999, color: '#0E0EA8' },
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

const ALL_999 = [999, 999, 999] as const;

const SAMPLE_SERIES: AllYearsDiseaseGenderSeries = {
  Healthy: ALL_999,
  Increased: ALL_999,
  High: ALL_999,
  'Very High': ALL_999,
};

export const DUMMY_ALL_YEARS_DISEASE_YEARS = [2024, 2025, 2026] as const;

export const DUMMY_ALL_YEARS_DISEASE_DEEP_DIVE: AllYearsDiseaseDeepDiveRow[] = [
  { code: 'nafld', name: 'NAFLD', male: SAMPLE_SERIES, female: SAMPLE_SERIES },
  {
    code: 'type_2_diabetes',
    name: 'Type 2 Diabetes',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  {
    code: 'cardiac_health',
    name: 'Cardiac Health',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  {
    code: 'hypertension',
    name: 'Hypertension',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  {
    code: 'thyroid_health',
    name: 'Thyroid Health',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  { code: 'obesity', name: 'Obesity', male: SAMPLE_SERIES, female: SAMPLE_SERIES },
  {
    code: 'dyslipidemia',
    name: 'Dyslipidemia',
    male: SAMPLE_SERIES,
    female: SAMPLE_SERIES,
  },
  { code: 'pcos_pcod', name: 'PCOS/PCOD', male: SAMPLE_SERIES, female: SAMPLE_SERIES },
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
      { year: 2023, lit: 999 },
      { year: 2024, lit: 999 },
      { year: 2025, lit: 999 },
    ],
    deltaPercent: 999,
  },
  {
    id: 'd3',
    name: 'Vitamin D3',
    years: [
      { year: 2023, lit: 999 },
      { year: 2024, lit: 999 },
      { year: 2025, lit: 999 },
    ],
    deltaPercent: 999,
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    years: [
      { year: 2023, lit: 999 },
      { year: 2024, lit: 999 },
      { year: 2025, lit: 999 },
    ],
    deltaPercent: 999,
  },
  {
    id: 'lipid',
    name: 'Lipid',
    years: [
      { year: 2023, lit: 999 },
      { year: 2024, lit: 999 },
      { year: 2025, lit: 999 },
    ],
    deltaPercent: 999,
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory',
    years: [
      { year: 2023, lit: 999 },
      { year: 2024, lit: 999 },
      { year: 2025, lit: 999 },
    ],
    deltaPercent: 999,
  },
] as const;

/**
 * TEMPORARY — Oxidative stress severity by year (All Years Camp Report).
 * Newest → oldest for concentric rings (outer → inner). Percents sum ≈ 100 per year.
 */
export const DUMMY_ALL_YEARS_OXIDATIVE = [
  {
    year: 2026,
    low: 999,
    moderate: 999,
    high: 999,
    veryHigh: 999,
  },
  {
    year: 2025,
    low: 999,
    moderate: 999,
    high: 999,
    veryHigh: 999,
  },
  {
    year: 2024,
    low: 999,
    moderate: 999,
    high: 999,
    veryHigh: 999,
  },
] as const;

/** Design copy for All Years summary until API provides YoY elevated delta. */
export const DUMMY_ALL_YEARS_OXIDATIVE_IMPROVEMENT_PERCENT = 999;

export const DUMMY_ALL_YEARS_OXIDATIVE_CONCERN =
  'A portion of employees show elevated oxidative stress, suggesting early signs of lifestyle-related strain. Addressing recovery, nutrition, and stress management can help prevent long-term health impacts. Encourage antioxidant-rich nutrition, regular movement, and healthy sleep habits.';

