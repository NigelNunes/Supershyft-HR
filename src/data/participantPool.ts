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

function buildParticipant(index: number): CampParticipant {
  const rand = seeded(1000 + index * 53);
  const dept = DEPARTMENTS[index % DEPARTMENTS.length];
  const gender = genderForIndex(index);
  const age = Math.round(22 + rand() * 33);
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
  };
}

/** Representative enrolled camp cohort (demo KPIs use this length directly — SCALE = 1). */
export const CAMP_PARTICIPANTS: CampParticipant[] = Array.from({ length: 362 }, (_, i) =>
  buildParticipant(i),
);

export const DISPLAY_ENROLLED = CAMP_PARTICIPANTS.length;
export const ORG_HEADCOUNT = Math.round(DISPLAY_ENROLLED / 0.875);
