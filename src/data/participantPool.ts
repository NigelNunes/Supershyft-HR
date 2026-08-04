/**
 * Simulated camp participants built from dev-api report shapes
 * (overview + health-span-index). Aggregated in aggregateHrDashboard.ts.
 */

import type { ApiHealthSpanIndex, ApiOverviewReport, ApiRiskAnalysisItem } from '../services/apiTypes';
import { DISEASES } from './diseases';

export const DEPARTMENTS = [
  'Technology',
  'R&D',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Marketing',
  'Legal',
  'Customer Success',
  'Supply Chain',
] as const;

/**
 * Demo headcounts — varied by typical corp mix.
 * Must sum to the canonical 2026 enrolled total (1120) so dept KPIs match the dashboard.
 */
export const DEPARTMENT_HEADCOUNTS: Record<(typeof DEPARTMENTS)[number], number> = {
  Technology: 224,
  'R&D': 148,
  Sales: 170,
  Operations: 179,
  Finance: 87,
  HR: 56,
  Marketing: 99,
  Legal: 43,
  'Customer Success': 68,
  'Supply Chain': 46,
};

export function departmentSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Flat department assignment list matching DEPARTMENT_HEADCOUNTS. */
export const DEPARTMENT_ASSIGNMENTS: (typeof DEPARTMENTS)[number][] = DEPARTMENTS.flatMap((name) =>
  Array.from({ length: DEPARTMENT_HEADCOUNTS[name] }, () => name),
);
const AGE_GROUPS = ['18–25', '26–35', '36–45', '46–55', '55+'] as const;

/** Display buckets for physical activity pies. */
export const PHYSICAL_ACTIVITY_BUCKETS = [
  'Less than 30mins',
  '30-60mins',
  'More than 60 mins',
  'Rarely or Never',
] as const;
export type PhysicalActivityBucket = (typeof PHYSICAL_ACTIVITY_BUCKETS)[number];

/** Display buckets for sleep pies. */
export const SLEEP_BUCKETS = ['Less than 5', '5-7', '7-9', 'More than 9'] as const;
export type SleepBucket = (typeof SLEEP_BUCKETS)[number];

const PHYSICAL_ACTIVITY_API_LABELS = [
  'Less than 30 minutes a day',
  'Between 30 to 60 minutes a day',
  'More than 60 minutes a day',
  'Rarely or never',
  '1 to 3 hours',
] as const;

const SLEEP_API_LABELS = [
  'Less than 5 hours',
  'Between 5 to 7 hours',
  'Between 7 to 9 hours',
  'More than 9 hours',
] as const;

const HABIT_LABELS = [
  'Regular physical activity',
  'Adequate sleep (7–9 hrs)',
  'Low alcohol consumption',
  'Balanced meal timing',
  'Adequate hydration',
] as const;

const HEALTHY_PROFILES = [
  'Thyroid panel',
  'Kidney function',
  'Complete blood count',
  'Lipid panel',
  'Vitamin panel',
] as const;

export interface CampParticipant {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: string;
  department: string;
  gender: 'Male' | 'Female';
  age: number;
  ageGroup: (typeof AGE_GROUPS)[number];
  chronologicalAge: number;
  overview: ApiOverviewReport;
  healthSpan: ApiHealthSpanIndex;
  oxidativeBand: 'low' | 'moderate' | 'high' | 'veryHigh';
  bloodTestDone: boolean;
  doctorConsultation: boolean;
  /** Explicit bio-AI completion — calibrated to match dashboard bio-AI KPI. */
  bioAiDone: boolean;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function ageToGroup(age: number): (typeof AGE_GROUPS)[number] {
  if (age <= 25) return '18–25';
  if (age <= 35) return '26–35';
  if (age <= 45) return '36–45';
  if (age <= 55) return '46–55';
  return '55+';
}

/** Separate seed stream — camp index seeds all yield first draws < 0.44 otherwise. */
function genderForIndex(index: number): 'Male' | 'Female' {
  const rand = seeded(50_000 + index * 7919);
  return rand() > 0.48 ? 'Male' : 'Female';
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Maps dev-api MetSights risk_status to dashboard RiskLevel buckets. */
export function apiRiskStatusToLevel(status: string): 'Healthy' | 'Increased' | 'High' | 'Very High' {
  const s = status.trim();
  if (s === 'Healthy') return 'Healthy';
  if (s === 'Moderate' || s === 'Increased') return 'Increased';
  if (s === 'Very High') return 'Very High';
  if (s === 'High') return 'High';
  return 'Increased';
}

function buildDiseasesForParticipant(
  rand: () => number,
  profile: 'healthy' | 'mixed' | 'elevated',
): ApiRiskAnalysisItem[] {
  return DISEASES.map((d) => {
    let risk_status: string;
    let risk_score_scaled: number;
    if (profile === 'healthy') {
      risk_status = rand() > 0.35 ? 'Healthy' : 'Moderate';
      risk_score_scaled = risk_status === 'Healthy' ? Math.round(8 + rand() * 18) : Math.round(28 + rand() * 15);
    } else if (profile === 'elevated') {
      const roll = rand();
      if (roll < 0.25) {
        risk_status = 'Healthy';
        risk_score_scaled = Math.round(10 + rand() * 20);
      } else if (roll < 0.5) {
        risk_status = 'Moderate';
        risk_score_scaled = Math.round(38 + rand() * 18);
      } else if (roll < 0.8) {
        risk_status = 'Increased';
        risk_score_scaled = Math.round(52 + rand() * 20);
      } else {
        risk_status = rand() > 0.5 ? 'High' : 'Very High';
        risk_score_scaled = Math.round(68 + rand() * 28);
      }
    } else {
      const roll = rand();
      if (roll < 0.45) {
        risk_status = 'Healthy';
        risk_score_scaled = Math.round(12 + rand() * 22);
      } else if (roll < 0.75) {
        risk_status = 'Moderate';
        risk_score_scaled = Math.round(32 + rand() * 22);
      } else if (roll < 0.92) {
        risk_status = 'Increased';
        risk_score_scaled = Math.round(48 + rand() * 22);
      } else {
        risk_status = 'High';
        risk_score_scaled = Math.round(62 + rand() * 25);
      }
    }
    return {
      code: d.code,
      name: d.name,
      risk_status,
      risk_score_scaled,
      healthy_percentile: Math.max(0, Math.min(100, 100 - risk_score_scaled + Math.round(rand() * 10 - 5))),
    };
  });
}

export function physicalActivityFromApi(label: string | null | undefined): PhysicalActivityBucket {
  const s = (label ?? '').toLowerCase();
  if (s.includes('rarely') || s.includes('never')) return 'Rarely or Never';
  if (s.includes('more than 60') || s.includes('1 to 3 hours') || s.includes('1-3')) {
    return 'More than 60 mins';
  }
  if (s.includes('30 to 60') || s.includes('30-60') || s.includes('between 30')) {
    return '30-60mins';
  }
  if (s.includes('less than 30') || s.includes('< 30')) return 'Less than 30mins';
  return '30-60mins';
}

export function sleepBucketFromApi(label: string | null | undefined): SleepBucket {
  const s = (label ?? '').toLowerCase();
  if (s.includes('more than 9') || s.includes('9+') || s.includes('over 9')) return 'More than 9';
  if (s.includes('7 to 9') || s.includes('7-9')) return '7-9';
  if (s.includes('5 to 7') || s.includes('5-7')) return '5-7';
  if (s.includes('less than 5') || s.includes('< 5')) return 'Less than 5';
  return '5-7';
}

/** Canonical 2026 age-band quotas — must match DUMMY_ALL_YEARS_AGE_PARTICIPATION. */
const AGE_BAND_QUOTAS_2026: { group: (typeof AGE_GROUPS)[number]; count: number; min: number; max: number }[] = [
  { group: '18–25', count: 134, min: 18, max: 25 },
  { group: '26–35', count: 246, min: 26, max: 35 },
  { group: '36–45', count: 381, min: 36, max: 45 },
  { group: '46–55', count: 224, min: 46, max: 55 },
  { group: '55+', count: 135, min: 56, max: 64 },
];

/** KPI targets aligned with YEAR_KPI_CORE / getDummyYearKpis(2026). */
export const COHORT_2026_TARGETS = {
  enrolled: 1120,
  male: 605,
  female: 515,
  bloodTests: 1053,
  bioAiReports: 952,
  doctorConsultations: 538,
  /** Overall-risk "High risk" band — matches KPI highRiskGroup. */
  overallHighRisk: 56,
  overallIncreased: 224,
  overallLow: 560,
  overallOptimal: 280,
  /** Metabolic age gap bands (good / attention / high). */
  metabolicGood: 504,
  metabolicAttention: 448,
  metabolicHigh: 168,
} as const;

function buildParticipant(index: number): CampParticipant {
  const rand = seeded(1000 + index * 53);
  const dept = DEPARTMENT_ASSIGNMENTS[index] ?? DEPARTMENTS[index % DEPARTMENTS.length];
  const gender = genderForIndex(index);
  // Placeholder age — overwritten by calibrateCohortTo2026.
  const age = Math.round(28 + rand() * 25);
  const chronologicalAge = age;
  const deptRisk = dept === 'Sales' || dept === 'R&D' ? 'elevated' : dept === 'HR' || dept === 'Finance' ? 'healthy' : 'mixed';
  const profile = rand() < 0.22 ? 'elevated' : rand() < 0.55 ? 'mixed' : deptRisk === 'elevated' ? 'mixed' : 'healthy';

  const gapYears =
    profile === 'elevated'
      ? 2.5 + rand() * 4
      : profile === 'mixed'
        ? 0.8 + rand() * 2.8
        : rand() * 2.2;
  const metabolic_age = Math.round((chronologicalAge + gapYears) * 10) / 10;

  const diseases = buildDiseasesForParticipant(rand, profile);
  const lowRisk = diseases
    .filter((d) => d.risk_status === 'Healthy')
    .sort((a, b) => a.risk_score_scaled - b.risk_score_scaled)
    .slice(0, 3)
    .map((d) => ({
      code: d.code,
      name: d.name,
      risk_status: d.risk_status,
      risk_score_scaled: d.risk_score_scaled,
    }));

  const risk_analysis = [...diseases].sort((a, b) => b.risk_score_scaled - a.risk_score_scaled);

  const nutritionBase = profile === 'healthy' ? 3.6 : profile === 'mixed' ? 3.2 : 2.7;
  const fitnessBase = gender === 'Male' && profile !== 'healthy' ? 2.6 : 3.1;
  const lifestyleBase = profile === 'elevated' ? 2.5 : 3.3;

  const physical =
    profile === 'elevated'
      ? pick(['Less than 30 minutes a day', 'Rarely or never', 'Between 30 to 60 minutes a day'], rand)
      : profile === 'healthy'
        ? pick(['More than 60 minutes a day', 'Between 30 to 60 minutes a day'], rand)
        : pick(PHYSICAL_ACTIVITY_API_LABELS, rand);

  const sleep =
    profile === 'elevated' && gender === 'Male'
      ? pick(['Less than 5 hours', 'Between 5 to 7 hours'], rand)
      : profile === 'healthy'
        ? pick(['Between 7 to 9 hours', 'More than 9 hours'], rand)
        : pick(SLEEP_API_LABELS, rand);

  const oxRoll = rand();
  const oxidativeBand: CampParticipant['oxidativeBand'] =
    profile === 'elevated'
      ? oxRoll < 0.15
        ? 'low'
        : oxRoll < 0.4
          ? 'moderate'
          : oxRoll < 0.75
            ? 'high'
            : 'veryHigh'
      : oxRoll < 0.45
        ? 'low'
        : oxRoll < 0.78
          ? 'moderate'
          : oxRoll < 0.92
            ? 'high'
            : 'veryHigh';

  const employeeNo = String(index + 1).padStart(3, '0');
  const displayName = `employee${employeeNo}`;

  return {
    id: `emp-${employeeNo}`,
    name: displayName,
    phone: `98${String(10000000 + index * 111111).slice(0, 8)}`,
    email: `${displayName}@abc.demo`,
    bloodGroup: pick(['O+', 'A+', 'B+', 'AB+', 'O-', 'B-'], rand),
    department: dept,
    gender,
    age,
    ageGroup: ageToGroup(age),
    chronologicalAge,
    overview: {
      assessment_id: 88000 + index,
      metabolic_age,
      positive_wins: {
        low_risk: lowRisk,
        healthy_habits: HABIT_LABELS.slice(0, 2 + Math.floor(rand() * 2)).map((habit_label, i) => ({
          habit_key: `habit_${i}`,
          habit_label,
        })),
        healthy_profiles: HEALTHY_PROFILES.slice(0, 2 + Math.floor(rand() * 2)),
      },
      risk_analysis,
    },
    healthSpan: {
      nutrition_score: Math.round((nutritionBase + (rand() - 0.5) * 0.8) * 10) / 10,
      fitness_score: Math.round((fitnessBase + (rand() - 0.5) * 0.7) * 10) / 10,
      lifestyle_score: Math.round((lifestyleBase + (rand() - 0.5) * 0.6) * 10) / 10,
      lifestyle: {
        physical_activity: physical,
        sleep,
        smoke: rand() > 0.88 ? 'Occasionally' : 'I do not smoke',
        alcohol: rand() > 0.82 ? 'Occasionally' : 'I do not drink alcohol',
      },
    },
    oxidativeBand,
    bloodTestDone: rand() > 0.06,
    doctorConsultation: gapYears >= 3 ? rand() > 0.35 : rand() > 0.78,
    bioAiDone: false,
  };
}

function shuffleIndices(length: number, seed: number): number[] {
  const rand = seeded(seed);
  const idx = Array.from({ length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Forces pool aggregates to match dashboard 2026 KPIs / charts exactly
 * (enrolled, gender, age bands, blood, doctor, metabolic, overall risk).
 */
function calibrateCohortTo2026(raw: CampParticipant[]): CampParticipant[] {
  const participants = raw.map((p) => ({ ...p, overview: { ...p.overview }, healthSpan: { ...p.healthSpan } }));
  const n = participants.length;
  const t = COHORT_2026_TARGETS;
  if (n !== t.enrolled) {
    throw new Error(`Cohort size ${n} !== ${t.enrolled}; check DEPARTMENT_HEADCOUNTS`);
  }

  // Ages — exact band quotas
  const ages: number[] = [];
  const ageRand = seeded(42_001);
  for (const band of AGE_BAND_QUOTAS_2026) {
    for (let i = 0; i < band.count; i += 1) {
      ages.push(band.min + Math.floor(ageRand() * (band.max - band.min + 1)));
    }
  }
  const ageOrder = shuffleIndices(n, 42_002);
  ageOrder.forEach((pi, ai) => {
    const age = ages[ai]!;
    participants[pi]!.age = age;
    participants[pi]!.chronologicalAge = age;
    participants[pi]!.ageGroup = ageToGroup(age);
  });

  // Gender — exact 605 / 515
  const genderOrder = shuffleIndices(n, 42_003);
  genderOrder.forEach((pi, gi) => {
    participants[pi]!.gender = gi < t.male ? 'Male' : 'Female';
  });

  // Blood + doctor + bio-AI flags (doctor ⊆ blood ⊆ bio requires blood)
  participants.forEach((p) => {
    p.bloodTestDone = false;
    p.doctorConsultation = false;
    p.bioAiDone = false;
  });
  const flagOrder = shuffleIndices(n, 42_004);
  for (let i = 0; i < t.bloodTests; i += 1) {
    participants[flagOrder[i]!]!.bloodTestDone = true;
  }
  for (let i = 0; i < t.doctorConsultations; i += 1) {
    participants[flagOrder[i]!]!.doctorConsultation = true;
    participants[flagOrder[i]!]!.bloodTestDone = true;
  }
  for (let i = 0; i < t.bioAiReports; i += 1) {
    participants[flagOrder[i]!]!.bioAiDone = true;
    participants[flagOrder[i]!]!.bloodTestDone = true;
  }

  // Metabolic gap bands → good / attention / highRisk chart
  const metOrder = shuffleIndices(n, 42_005);
  metOrder.forEach((pi, mi) => {
    const p = participants[pi]!;
    let gap: number;
    if (mi < t.metabolicHigh) gap = 3.2 + (mi % 20) * 0.12;
    else if (mi < t.metabolicHigh + t.metabolicAttention) gap = 2.05 + (mi % 15) * 0.05;
    else gap = (mi % 18) * 0.1;
    p.overview = {
      ...p.overview,
      metabolic_age: Math.round((p.chronologicalAge + gap) * 10) / 10,
    };
  });

  // Overall risk bands via disease score calibration (matches overall-risk chart + highRiskGroup)
  const riskOrder = shuffleIndices(n, 42_006);
  const bandTargets: { band: 'Optimal' | 'Low risk' | 'Increased Risk' | 'High risk'; count: number; score: number }[] = [
    { band: 'High risk', count: t.overallHighRisk, score: 72 },
    { band: 'Increased Risk', count: t.overallIncreased, score: 50 },
    { band: 'Low risk', count: t.overallLow, score: 34 },
    { band: 'Optimal', count: t.overallOptimal, score: 18 },
  ];
  let cursor = 0;
  for (const target of bandTargets) {
    for (let i = 0; i < target.count; i += 1) {
      const p = participants[riskOrder[cursor]!]!;
      cursor += 1;
      p.overview = {
        ...p.overview,
        risk_analysis: p.overview.risk_analysis.map((d) => ({
          ...d,
          risk_score_scaled: target.score,
          risk_status:
            target.score >= 68 ? 'High' : target.score >= 48 ? 'Increased' : target.score >= 30 ? 'Moderate' : 'Healthy',
        })),
      };
      // Keep lifestyle scores mid so composite ≈ diseaseAvg*0.5 + gap*0.3*22 + mid*0.2
      const mid = target.band === 'Optimal' ? 4.2 : target.band === 'Low risk' ? 3.5 : target.band === 'Increased Risk' ? 2.8 : 2.2;
      p.healthSpan = {
        ...p.healthSpan,
        nutrition_score: mid,
        fitness_score: mid,
        lifestyle_score: mid,
      };
    }
  }

  return participants;
}

/** Representative 2026 enrolled camp cohort — KPIs/charts/employees all read from this. */
export const CAMP_PARTICIPANTS: CampParticipant[] = calibrateCohortTo2026(
  Array.from({ length: DEPARTMENT_ASSIGNMENTS.length }, (_, i) => buildParticipant(i)),
);

export const DISPLAY_ENROLLED = CAMP_PARTICIPANTS.length;
export const ORG_HEADCOUNT = Math.round(DISPLAY_ENROLLED / 0.875);
