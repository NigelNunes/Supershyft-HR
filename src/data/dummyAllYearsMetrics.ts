/**
 * TEMPORARY DUMMY DATA — All Years dashboard views.
 * Delete this file (and its imports) when multi-year API is wired.
 */
export const DUMMY_ALL_YEARS_METRICS = {
  years: [2024, 2025, 2026] as const,
  nationalRank: [56, 48, 41] as const,
  industryRank: [56, 48, 41] as const,
  employees: [80, 180, 140] as const,
  bloodTests: [80, 180, 140] as const,
  bioAiReports: [80, 180, 140] as const,
  consultations: [80, 180, 140] as const,
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

/** Insight copy for All Years age participation (dummy). */
export const DUMMY_ALL_YEARS_AGE_INSIGHT =
  '36-45 is the largest cohort at 34.3% (48 employees) — tailor camp messaging and scheduling for under-represented age bands.';

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
  '15% Employees have their metabolic age >3 years of their actual age';

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
  nationalRank: 17,
  nationalAmong: 38,
  nationalAmongLabel: 'Among 38 companies in region',
  industryRank: 4,
  industryAmong: 12,
  industryAmongLabel: 'Among 12 companies',
  cities: [
    { name: 'GURUGRAM', rank: 12, tone: 'red', top: '24%', left: '36%' },
    { name: 'PUNE', rank: 8, tone: 'blue', top: '46%', left: '4%' },
    { name: 'HYDERABAD', rank: 9, tone: 'pink', top: '58%', left: '48%' },
    { name: 'BANGALORE', rank: 3, tone: 'teal', top: '74%', left: '22%' },
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
