/**
 * Builds HR dashboard view models by aggregating simulated dev-api-shaped participant reports.
 */

import type {
  CampHistoryEntry,
  CompanyAverageScores,
  DashboardData,
  DepartmentDetail,
  DepartmentSummary,
  DiseaseRiskData,
  EmployeeRecord,
  GenderDistributionPair,
  Intervention,
  KeyInsightsData,
  KpiSummary,
  LifestyleIndicator,
  MetabolicAgeSummary,
  OverallRiskScoreBucket,
  ParticipationByAge,
  ParticipationByGender,
  PositiveWins,
  RiskLevel,
  ToggleDimension,
  TopHighRiskDisease,
} from '../types';
import {
  CAMP_PARTICIPANTS,
  DEPARTMENTS,
  DISPLAY_ENROLLED,
  ORG_HEADCOUNT,
  apiRiskStatusToLevel,
  physicalActivityFromApi,
  sleepBucketFromApi,
  PHYSICAL_ACTIVITY_BUCKETS,
  SLEEP_BUCKETS,
  type CampParticipant,
} from './participantPool';
import { DISEASES } from './diseases';
import {
  buildAlignedJourney,
  temporaryAge,
} from '../services/campParticipantsMappers';

const GENDER_KEYS = ['Male', 'Female'];
const AGE_GROUPS = ['18–25', '26–35', '36–45', '46–55', '55+'] as const;

const SCALE = DISPLAY_ENROLLED / CAMP_PARTICIPANTS.length;

function scaleCount(n: number): number {
  return Math.round(n * SCALE);
}

function metabolicGapYears(p: CampParticipant): number {
  const ma = p.overview.metabolic_age;
  if (ma == null) return 0;
  return Math.max(0, ma - p.chronologicalAge);
}

function isHighMetabolicRisk(p: CampParticipant): boolean {
  return metabolicGapYears(p) >= 3;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function overallRiskBandFromScore(score: number): OverallRiskScoreBucket['band'] {
  if (score <= 25) return 'Optimal';
  if (score <= 42) return 'Low risk';
  if (score <= 58) return 'Increased Risk';
  return 'High risk';
}

function compositeRiskScore(p: CampParticipant): number {
  const diseases = p.overview.risk_analysis;
  const diseaseAvg = avg(diseases.map((d) => d.risk_score_scaled));
  const gap = metabolicGapYears(p);
  const gapScore = Math.min(100, gap * 22);
  const hs = p.healthSpan;
  const spanAvg =
    avg(
      [hs.nutrition_score, hs.fitness_score, hs.lifestyle_score].filter(
        (v): v is number => v != null,
      ).map((s) => (5 - s) * 20),
    ) || 40;
  return diseaseAvg * 0.5 + gapScore * 0.3 + spanAvg * 0.2;
}

function buildMetabolicAge(participants: CampParticipant[]): MetabolicAgeSummary {
  const enrolled = participants.length;
  let onTrack = 0;
  let watch = 0;
  let high = 0;
  let gapSum = 0;

  for (const p of participants) {
    const gap = metabolicGapYears(p);
    gapSum += gap;
    if (gap >= 3) high += 1;
    else if (gap >= 2) watch += 1;
    else onTrack += 1;
  }

  return {
    buckets: [
      {
        label: 'On track (0–2 yrs gap)',
        count: scaleCount(onTrack),
        percent: percent(onTrack, enrolled),
        isHighRisk: false,
      },
      {
        label: 'Watch (2–3 yrs gap)',
        count: scaleCount(watch),
        percent: percent(watch, enrolled),
        isHighRisk: false,
      },
      {
        label: 'High risk (3+ yrs gap)',
        count: scaleCount(high),
        percent: percent(high, enrolled),
        isHighRisk: true,
      },
    ],
    avgGapYears: Math.round((gapSum / enrolled) * 10) / 10,
    highRiskPercent: percent(high, enrolled),
  };
}

function buildTopHighRiskDiseases(participants: CampParticipant[]): TopHighRiskDisease[] {
  return DISEASES.map((disease) => {
    let elevated = 0;
    for (const p of participants) {
      const item = p.overview.risk_analysis.find((x) => x.code === disease.code);
      if (item && item.risk_status !== 'Healthy') elevated += 1;
    }
    return {
      name: disease.name,
      highRiskPercent: percent(elevated, participants.length),
    };
  })
    .sort((a, b) => b.highRiskPercent - a.highRiskPercent)
    .slice(0, 3);
}

/** dev-api health-span scores are 1–5; HR dashboard displays 0–100. */
function scoreTo100(score1to5: number): number {
  return Math.round(score1to5 * 20 * 10) / 10;
}

function buildCompanyScores(participants: CampParticipant[]): CompanyAverageScores {
  return {
    nutrition: scoreTo100(avg(participants.map((p) => p.healthSpan.nutrition_score ?? 0))),
    fitness: scoreTo100(avg(participants.map((p) => p.healthSpan.fitness_score ?? 0))),
    lifestyle: scoreTo100(avg(participants.map((p) => p.healthSpan.lifestyle_score ?? 0))),
  };
}

function buildOverallRiskScore(participants: CampParticipant[]): OverallRiskScoreBucket[] {
  const bands: Record<OverallRiskScoreBucket['band'], number> = {
    Optimal: 0,
    'Low risk': 0,
    'Increased Risk': 0,
    'High risk': 0,
  };
  for (const p of participants) {
    bands[overallRiskBandFromScore(compositeRiskScore(p))] += 1;
  }
  const total = participants.length;
  return (Object.keys(bands) as OverallRiskScoreBucket['band'][]).map((band) => ({
    band,
    count: scaleCount(bands[band]),
    percent: percent(bands[band], total),
  }));
}

function buildGenderDistribution(
  participants: CampParticipant[],
  tierFn: (p: CampParticipant) => string,
  labels: string[],
): GenderDistributionPair {
  const count = (gender: 'Male' | 'Female', label: string) =>
    participants.filter((p) => p.gender === gender && tierFn(p) === label).length;

  const maleTotal = participants.filter((p) => p.gender === 'Male').length || 1;
  const femaleTotal = participants.filter((p) => p.gender === 'Female').length || 1;

  return {
    male: labels.map((label) => ({
      label,
      percent: percent(count('Male', label), maleTotal),
    })),
    female: labels.map((label) => ({
      label,
      percent: percent(count('Female', label), femaleTotal),
    })),
  };
}

function buildDiseaseDataFromPool(
  participants: CampParticipant[],
  segmentKey: (p: CampParticipant) => string,
  segmentValues: string[],
): DiseaseRiskData[] {
  const levels: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];

  return DISEASES.map((disease) => {
    const buckets = levels.map((level) => {
      const segments: Record<string, number> = {};
      for (const seg of segmentValues) {
        const inSeg = participants.filter((p) => segmentKey(p) === seg);
        const count = inSeg.filter((p) => {
          const d = p.overview.risk_analysis.find((x) => x.code === disease.code);
          return d && apiRiskStatusToLevel(d.risk_status) === level;
        }).length;
        segments[seg] = percent(count, inSeg.length || 1);
      }
      return { level, segments };
    });

    const healthy = buckets.find((b) => b.level === 'Healthy');
    const healthySum = healthy
      ? Object.values(healthy.segments).reduce((a, b) => a + b, 0) / segmentValues.length
      : 0;
    const overallStatus: RiskLevel =
      healthySum >= 75 ? 'Healthy' : healthySum >= 55 ? 'Increased' : healthySum >= 40 ? 'High' : 'Very High';

    return { disease, buckets, overallStatus };
  });
}

function buildLifestyleIndicators(
  participants: CampParticipant[],
  segmentKey: (p: CampParticipant) => string,
  segmentValues: string[],
): LifestyleIndicator[] {
  const physicalLabels = PHYSICAL_ACTIVITY_BUCKETS;
  const sleepLabels = SLEEP_BUCKETS;

  const physicalBuckets = physicalLabels.map((label) => {
    const segments: Record<string, number> = {};
    for (const seg of segmentValues) {
      const inSeg = participants.filter((p) => segmentKey(p) === seg);
      const count = inSeg.filter(
        (p) => physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity) === label,
      ).length;
      segments[seg] = percent(count, inSeg.length || 1);
    }
    return { label, segments };
  });

  const sleepBuckets = sleepLabels.map((label) => {
    const segments: Record<string, number> = {};
    for (const seg of segmentValues) {
      const inSeg = participants.filter((p) => segmentKey(p) === seg);
      const count = inSeg.filter(
        (p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep) === label,
      ).length;
      segments[seg] = percent(count, inSeg.length || 1);
    }
    return { label, segments };
  });

  const male = participants.filter((p) => p.gender === 'Male');
  const female = participants.filter((p) => p.gender === 'Female');
  const maleLow = percent(
    male.filter(
      (p) =>
        physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity) === 'Less than 30mins' ||
        physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity) === 'Rarely or Never',
    ).length,
    male.length || 1,
  );
  const femaleLow = percent(
    female.filter(
      (p) =>
        physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity) === 'Less than 30mins' ||
        physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity) === 'Rarely or Never',
    ).length,
    female.length || 1,
  );
  const maleSleep = percent(
    male.filter((p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep) === '7-9').length,
    male.length || 1,
  );
  const femaleSleep = percent(
    female.filter((p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep) === '7-9').length,
    female.length || 1,
  );

  return [
    {
      id: 'physical-activity',
      title: 'Physical Activity Levels',
      buckets: physicalBuckets,
      insight: {
        tone: maleLow > 60 ? 'concern' : 'neutral',
        text: `${maleLow}% of men and ${femaleLow}% of women report low activity or rarely exercise (FitPrint lifestyle data).`,
      },
    },
    {
      id: 'sleep-quality',
      title: 'Sleep Quality',
      buckets: sleepBuckets,
      insight: {
        tone: 'positive',
        text: `${femaleSleep}% of women and ${maleSleep}% of men report 7–9 hours of sleep per night.`,
      },
    },
  ];
}

function aggregatePositiveWins(participants: CampParticipant[]): PositiveWins {
  const byCode = new Map<string, { name: string; healthy: number; total: number }>();
  for (const p of participants) {
    for (const d of p.overview.risk_analysis) {
      const cur = byCode.get(d.code) ?? { name: d.name, healthy: 0, total: 0 };
      cur.total += 1;
      if (d.risk_status === 'Healthy') cur.healthy += 1;
      byCode.set(d.code, cur);
    }
  }
  const lowRisk = [...byCode.entries()]
    .filter(([, v]) => v.healthy / v.total >= 0.55)
    .sort((a, b) => b[1].healthy / b[1].total - a[1].healthy / a[1].total)
    .slice(0, 3)
    .map(([code, v]) => ({
      code,
      name: v.name,
      riskStatus: 'Healthy',
    }));

  const habitCounts = new Map<string, number>();
  for (const p of participants) {
    for (const h of p.overview.positive_wins.healthy_habits) {
      habitCounts.set(h.habit_label, (habitCounts.get(h.habit_label) ?? 0) + 1);
    }
  }
  const healthyHabits = [...habitCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([habitLabel]) => ({ habitLabel }));

  const profileCounts = new Map<string, number>();
  for (const p of participants) {
    for (const name of p.overview.positive_wins.healthy_profiles) {
      profileCounts.set(name, (profileCounts.get(name) ?? 0) + 1);
    }
  }
  const healthyProfiles = [...profileCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return { lowRisk, healthyHabits, healthyProfiles };
}

function buildParticipationByAge(participants: CampParticipant[]): ParticipationByAge[] {
  const total = participants.length;
  return AGE_GROUPS.map((ageGroup) => {
    const enrolled = participants.filter((p) => p.ageGroup === ageGroup).length;
    return {
      ageGroup,
      enrolled: scaleCount(enrolled),
      percent: percent(enrolled, total),
    };
  });
}

function buildParticipationByGender(participants: CampParticipant[]): ParticipationByGender[] {
  const total = participants.length;
  return GENDER_KEYS.map((gender) => {
    const enrolled = participants.filter((p) => p.gender === gender).length;
    return {
      gender,
      enrolled: scaleCount(enrolled),
      percent: percent(enrolled, total),
    };
  });
}

function buildDepartments(participants: CampParticipant[]): DepartmentSummary[] {
  return DEPARTMENTS.map((name) => {
    const inDept = participants.filter((p) => p.department === name);
    const headcount = Math.round(
      (inDept.length / participants.length) * ORG_HEADCOUNT,
    );
    const highRisk = inDept.filter(isHighMetabolicRisk).length;
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      headcount: Math.max(headcount, inDept.length),
      enrolledPercent: percent(inDept.length, headcount || 1),
      highRiskPercent: percent(highRisk, inDept.length || 1),
    };
  });
}

function buildOxidativeByDept(participants: CampParticipant[]) {
  return DEPARTMENTS.map((department) => {
    const inDept = participants.filter((p) => p.department === department);
    const total = inDept.length || 1;
    const low = inDept.filter((p) => p.oxidativeBand === 'low').length;
    const moderate = inDept.filter((p) => p.oxidativeBand === 'moderate').length;
    const high = inDept.filter((p) => p.oxidativeBand === 'high').length;
    const veryHigh = inDept.filter((p) => p.oxidativeBand === 'veryHigh').length;
    return {
      department,
      low: percent(low, total),
      moderate: percent(moderate, total),
      high: percent(high, total),
      veryHigh: percent(veryHigh, total),
    };
  });
}

function buildGenderComparison(participants: CampParticipant[]): DashboardData['genderComparison'] {
  const male = participants.filter((p) => p.gender === 'Male');
  const female = participants.filter((p) => p.gender === 'Female');
  const avgScore = (list: CampParticipant[], fn: (p: CampParticipant) => number) =>
    Math.round(avg(list.map(fn)));

  return [
    {
      metric: 'Metabolic risk',
      male: avgScore(male, compositeRiskScore),
      female: avgScore(female, compositeRiskScore),
    },
    {
      metric: 'Thyroid',
      male: avgScore(male, (p) => diseaseScore(p, 'thyroid_health')),
      female: avgScore(female, (p) => diseaseScore(p, 'thyroid_health')),
    },
    {
      metric: 'Hemoglobin',
      male: avgScore(male, (p) => 100 - diseaseScore(p, 'dyslipidemia') * 0.3),
      female: avgScore(female, (p) => 100 - diseaseScore(p, 'dyslipidemia') * 0.3 - 15),
    },
    {
      metric: 'Stress index',
      male: avgScore(male, (p) => (p.oxidativeBand === 'high' || p.oxidativeBand === 'veryHigh' ? 65 : 45)),
      female: avgScore(female, (p) => (p.oxidativeBand === 'high' || p.oxidativeBand === 'veryHigh' ? 55 : 40)),
    },
    {
      metric: 'Cardiac risk',
      male: avgScore(male, (p) => diseaseScore(p, 'cardiac_health')),
      female: avgScore(female, (p) => diseaseScore(p, 'cardiac_health')),
    },
  ];
}

function diseaseScore(p: CampParticipant, code: string): number {
  const d = p.overview.risk_analysis.find((x) => x.code === code);
  return d?.risk_score_scaled ?? 30;
}

const STATIC_KEY_INSIGHTS: KeyInsightsData = {
  insightCards: [
    {
      id: 'growth',
      title: 'Participant growth',
      variant: 'blue',
      bullets: [
        `${DISPLAY_ENROLLED.toLocaleString()} employees completed the 2024 camp (+15% vs 2023).`,
        'Enrollment rate reached 88%, up from 76% last year.',
        'Technology and R&D show highest first-time participation.',
      ],
    },
    {
      id: 'risk',
      title: 'Overall risk intensification',
      variant: 'red',
      bullets: [
        'Metabolic age gap ≥3 years remains the primary high-risk driver across departments.',
        'Dyslipidemia and Type 2 Diabetes show the largest elevated-risk segments in risk_analysis.',
        'Male employees index higher on composite metabolic risk scores.',
      ],
    },
    {
      id: 'oxidative',
      title: 'Oxidative stress',
      variant: 'orange',
      bullets: [
        'Sales department shows the highest combined High/Very High oxidative stress burden.',
        'Oxidative bands correlate with low activity and poor sleep in lifestyle data.',
      ],
    },
    {
      id: 'positive',
      title: 'Positive trends',
      variant: 'green',
      bullets: [
        'Thyroid, hypertension, and metabolic syndrome lead low-risk disease wins from overview reports.',
        'Healthy blood profiles cluster around thyroid and kidney panels.',
      ],
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle factors',
      variant: 'purple',
      bullets: [
        'FitPrint lifestyle scores highlight physical activity and sleep gaps in male cohorts.',
        'Nutrition scores from health-span-index average in the moderate band organisation-wide.',
      ],
    },
    {
      id: 'gender',
      title: 'Gender-specific patterns',
      variant: 'pink',
      bullets: [
        'Women show higher thyroid risk index; men higher cardiac and lipid indices.',
        'PCOS/PCOD indicators concentrated in female cohort under age 40.',
      ],
    },
    {
      id: 'emerging',
      title: 'Emerging risks',
      variant: 'yellow',
      bullets: [
        'Pre-diabetic trends in Operations from blood parameter panels.',
        'Vitamin D deficiency clusters in indoor / R&D roles.',
      ],
    },
  ],
  recommendationTiers: [
    {
      id: 'immediate',
      title: 'Immediate',
      timeframe: '0–3 months',
      variant: 'immediate',
      items: [
        'Launch targeted stress & recovery programme for Sales and Operations.',
        'Book cardiac and lipid screening for top dyslipidemia-risk employees.',
        'Mandate doctor consultations for metabolic age gap ≥3 years.',
      ],
    },
    {
      id: 'short',
      title: 'Short-term',
      timeframe: '3–6 months',
      variant: 'short',
      items: [
        'Department-level nutrition coaching from health-span nutrition scores.',
        'Sleep hygiene workshops for male employees and shift workers.',
      ],
    },
    {
      id: 'long',
      title: 'Long-term',
      timeframe: '6–12 months',
      variant: 'long',
      items: [
        'Establish annual wellness programme with YoY tracking.',
        'Integrate overview + health-span metrics into manager dashboards.',
      ],
    },
  ],
};

const STATIC_INTERVENTIONS: Intervention[] = [
  {
    id: '1',
    title: 'Launch structured fitness challenge',
    description: 'Target Technology and Operations — lowest activity cohorts.',
    impact: 'Projected 12% reduction in metabolic high-risk within 90 days.',
    priority: 'high',
    icon: 'activity',
  },
  {
    id: '2',
    title: 'Vitamin D & B12 supplementation programme',
    description: 'Group screening and guided supplementation for deficient cohorts.',
    impact: 'Could improve energy and immunity markers for ~35% of workforce.',
    priority: 'high',
    icon: 'pill',
  },
  {
    id: '3',
    title: 'Cardiac screening drive',
    description: 'Priority for employees with dyslipidemia or cardiac health flags.',
    impact: 'Early intervention may reduce long-term claims by up to 20%.',
    priority: 'high',
    icon: 'heart',
  },
  {
    id: '4',
    title: 'Sleep hygiene workshops',
    description: 'Focus on male employees and shift-based Operations teams.',
    impact: 'Better sleep correlates with 15% lower presenteeism.',
    priority: 'medium',
    icon: 'moon',
  },
  {
    id: '5',
    title: 'Nutrition counselling programme',
    description: 'Reduce refined carbohydrate dependency flagged in lifestyle data.',
    impact: 'Supports diabetes and NAFLD risk reduction organisation-wide.',
    priority: 'medium',
    icon: 'salad',
  },
];

const STATIC_BLOOD_PANELS: DashboardData['bloodPanels'] = [];

export function buildDashboardData(participants: CampParticipant[] = CAMP_PARTICIPANTS): DashboardData {
  const enrolled = participants.length;
  const bloodTests = participants.filter((p) => p.bloodTestDone).length;
  const doctorConsults = participants.filter((p) => p.doctorConsultation).length;
  const highRisk = participants.filter(isHighMetabolicRisk).length;

  const companyScores = buildCompanyScores(participants);

  const physicalLabels = [...PHYSICAL_ACTIVITY_BUCKETS];
  const sleepLabels = [...SLEEP_BUCKETS];

  const employees: EmployeeRecord[] = participants.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    email: p.email,
    bloodGroup: p.bloodGroup,
    department: p.department,
    gender: p.gender,
    age: temporaryAge(p.id),
    journey: buildAlignedJourney(p.id, {
      bloodTestDone: p.bloodTestDone,
      doctorConsultation: p.doctorConsultation,
    }),
  }));

  const nutritionistConsults = Math.round(doctorConsults * 0.75);
  const bioAiReports = employees.filter((e) => e.journey.bioAiReport === 'completed').length;

  const history: CampHistoryEntry[] = [
    {
      id: 'h1',
      year: 2024,
      label: 'Annual Wellness Camp 2024',
      participants: DISPLAY_ENROLLED,
      highRiskPercent: percent(highRisk, enrolled),
      enrolledPercent: Math.round((DISPLAY_ENROLLED / ORG_HEADCOUNT) * 100),
    },
    {
      id: 'h2',
      year: 2023,
      label: 'Annual Wellness Camp 2023',
      participants: 942,
      highRiskPercent: 28,
      enrolledPercent: 76,
    },
    {
      id: 'h3',
      year: 2022,
      label: 'Pilot Health Camp 2022',
      participants: 410,
      highRiskPercent: 31,
      enrolledPercent: 62,
    },
  ];

  return {
    org: { organizationId: 1, hasHistory: true, campYear: 2024 },
    hr: {
      name: 'Demo HR',
      phone: '+91 00000 00000',
      companyName: 'ABC',
      companyLogo: undefined,
    },
    kpis: {
      employeesEnrolled: DISPLAY_ENROLLED,
      totalBloodTest: scaleCount(bloodTests),
      totalBioAiReports: scaleCount(bioAiReports),
      bioAiPercent:
        DISPLAY_ENROLLED > 0
          ? Math.round((scaleCount(bioAiReports) / DISPLAY_ENROLLED) * 100)
          : 0,
      doctorConsultation: scaleCount(doctorConsults),
      nutritionistConsultation: scaleCount(nutritionistConsults),
      highRiskGroup: scaleCount(highRisk),
    },
    participationByAge: buildParticipationByAge(participants),
    participationByGender: buildParticipationByGender(participants),
    topHighRiskDiseases: buildTopHighRiskDiseases(participants),
    companyScores,
    overallRiskScore: buildOverallRiskScore(participants),
    physicalActivityByGender: buildGenderDistribution(
      participants,
      (p) => physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity),
      physicalLabels,
    ),
    sleepQualityByGender: buildGenderDistribution(
      participants,
      (p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep),
      sleepLabels,
    ),
    diseases: buildDiseaseDataFromPool(participants, (p) => p.gender, GENDER_KEYS),
    lifestyle: buildLifestyleIndicators(participants, (p) => p.gender, GENDER_KEYS),
    oxidativeStress: buildOxidativeByDept(participants),
    bloodPanels: STATIC_BLOOD_PANELS,
    genderComparison: buildGenderComparison(participants),
    metabolicAge: buildMetabolicAge(participants),
    positiveWins: aggregatePositiveWins(participants),
    nutrition: {
      avgScore: companyScores.nutrition,
      riskBand:
        companyScores.nutrition >= 70
          ? 'Healthy'
          : companyScores.nutrition >= 56
            ? 'Moderate'
            : 'Needs improvement',
      macros: [
        { name: 'Carbs', withinIdealPercent: 62, aboveIdealPercent: 22, belowIdealPercent: 16 },
        { name: 'Fats', withinIdealPercent: 71, aboveIdealPercent: 18, belowIdealPercent: 11 },
        { name: 'Protein', withinIdealPercent: 68, aboveIdealPercent: 14, belowIdealPercent: 18 },
        { name: 'Fibre', withinIdealPercent: 54, aboveIdealPercent: 8, belowIdealPercent: 38 },
        { name: 'Water', withinIdealPercent: 48, aboveIdealPercent: 35, belowIdealPercent: 17 },
      ],
    },
    bmiWaist: {
      bmiDistribution: [
        { label: 'Underweight', percent: 12 },
        { label: 'Normal', percent: 44 },
        { label: 'Overweight', percent: 31 },
        { label: 'Obese', percent: 13 },
      ],
      avgWaistInches: 34.8,
      aboveIdealWaistPercent: 42,
      insightTag: 'High abdominal trend in Operations & Sales',
    },
    bloodGroupNames: ['Lipid', 'Diabetes', 'Thyroid', 'Vitamin', 'Liver', 'Kidney', 'Inflammatory'],
    bloodGroupHeatmap: DEPARTMENTS.map((department) => {
      const inDept = participants.filter((p) => p.department === department);
      const r = avg(inDept.map((p) => compositeRiskScore(p)));
      const groups: Record<string, number> = {};
      ['Lipid', 'Diabetes', 'Thyroid', 'Vitamin', 'Liver', 'Kidney', 'Inflammatory'].forEach((g, i) => {
        groups[g] = Math.round(Math.max(52, Math.min(92, 78 - r * 0.15 + i * 2)));
      });
      return { department, groups };
    }),
    abnormalMarkers: [
      { testName: 'Vitamin D (25-OH)', abnormalPercent: 41 },
      { testName: 'Vitamin B12', abnormalPercent: 34 },
      { testName: 'HbA1c', abnormalPercent: 22 },
      { testName: 'LDL Cholesterol', abnormalPercent: 29 },
      { testName: 'TSH', abnormalPercent: 18 },
      { testName: 'Serum Ferritin', abnormalPercent: 16 },
      { testName: 'SGPT (ALT)', abnormalPercent: 14 },
      { testName: 'Hs-CRP', abnormalPercent: 12 },
    ],
    keyInsights: STATIC_KEY_INSIGHTS,
    interventions: STATIC_INTERVENTIONS,
    departments: buildDepartments(participants),
    employees,
    history,
  };
}

export function getDashboardForToggle(
  dimension: ToggleDimension,
  participants: CampParticipant[] = CAMP_PARTICIPANTS,
): Pick<DashboardData, 'diseases' | 'lifestyle'> {
  if (dimension === 'gender') {
    return {
      diseases: buildDiseaseDataFromPool(participants, (p) => p.gender, GENDER_KEYS),
      lifestyle: buildLifestyleIndicators(participants, (p) => p.gender, GENDER_KEYS),
    };
  }
  const deptKeys = [...DEPARTMENTS];
  return {
    diseases: buildDiseaseDataFromPool(participants, (p) => p.department, deptKeys),
    lifestyle: buildLifestyleIndicators(participants, (p) => p.department, deptKeys),
  };
}

export function buildDepartmentDetail(
  id: string,
  participants: CampParticipant[] = CAMP_PARTICIPANTS,
): DepartmentDetail | null {
  const deptSummary = buildDepartments(participants).find((d) => d.id === id);
  if (!deptSummary) return null;

  const inDept = participants.filter((p) => p.department === deptSummary.name);
  if (!inDept.length) return null;

  const oxTotal = inDept.length;
  const oxLow = inDept.filter((p) => p.oxidativeBand === 'low').length;
  const oxMod = inDept.filter((p) => p.oxidativeBand === 'moderate').length;
  const oxHigh = inDept.filter((p) => p.oxidativeBand === 'high').length;
  const oxVery = inDept.filter((p) => p.oxidativeBand === 'veryHigh').length;

  const spanScores100 = (p: CampParticipant) =>
    scoreTo100(
      avg(
        [p.healthSpan.nutrition_score, p.healthSpan.fitness_score, p.healthSpan.lifestyle_score].filter(
          (v): v is number => v != null,
        ),
      ),
    );

  const buildDist = (labels: string[], classify: (p: CampParticipant) => string) =>
    labels.map((label) => ({
      label,
      percent: percent(
        inDept.filter((p) => classify(p) === label).length,
        inDept.length,
      ),
    }));

  const rawMale = inDept.filter((p) => p.gender === 'Male').length;
  const rawFemale = inDept.filter((p) => p.gender === 'Female').length;
  const genderScale = deptSummary.headcount / (inDept.length || 1);
  const scaleDept = (n: number) => Math.round(n * genderScale);

  const bloodTests = inDept.filter((p) => p.bloodTestDone).length;
  const doctorConsults = inDept.filter((p) => p.doctorConsultation).length;
  /** Bio-AI not on participant yet — approximate as share of blood tests. */
  const bioAi = Math.round(bloodTests * 0.8);

  let metGood = 0;
  let metAttention = 0;
  let metHigh = 0;
  for (const p of inDept) {
    const gap = metabolicGapYears(p);
    if (gap >= 3) metHigh += 1;
    else if (gap >= 2) metAttention += 1;
    else metGood += 1;
  }

  const riskBands: Record<OverallRiskScoreBucket['band'], number> = {
    Optimal: 0,
    'Low risk': 0,
    'Increased Risk': 0,
    'High risk': 0,
  };
  for (const p of inDept) {
    riskBands[overallRiskBandFromScore(compositeRiskScore(p))] += 1;
  }

  const maleScaled = scaleDept(rawMale);
  const femaleScaled = scaleDept(rawFemale);
  const bloodScaled = scaleDept(bloodTests);
  const bioAiScaled = scaleDept(bioAi);
  const doctorScaled = scaleDept(doctorConsults);

  const kpis: KpiSummary = {
    employeesEnrolled: deptSummary.headcount,
    maleEnrolled: maleScaled,
    femaleEnrolled: femaleScaled,
    totalBloodTest: bloodScaled,
    bloodTestPercent: percent(bloodTests, inDept.length),
    totalBioAiReports: bioAiScaled,
    bioAiPercent: percent(bioAi, inDept.length),
    doctorConsultation: doctorScaled,
    nutritionistConsultation: 0,
    highRiskGroup: scaleDept(inDept.filter(isHighMetabolicRisk).length),
  };

  return {
    ...deptSummary,
    avgRiskScore: Math.round(avg(inDept.map(spanScores100)) * 10) / 10,
    topHighRiskDiseases: buildTopHighRiskDiseases(inDept),
    diseases: buildDiseaseDataFromPool(inDept, (p) => p.gender, GENDER_KEYS),
    genderBreakdown: {
      male: maleScaled,
      female: femaleScaled,
    },
    lifestyleDistribution: {
      physical: buildDist([...PHYSICAL_ACTIVITY_BUCKETS], (p) =>
        physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity),
      ),
      sleep: buildDist([...SLEEP_BUCKETS], (p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep)),
    },
    physicalActivityByGender: buildGenderDistribution(
      inDept,
      (p) => physicalActivityFromApi(p.healthSpan.lifestyle?.physical_activity),
      [...PHYSICAL_ACTIVITY_BUCKETS],
    ),
    sleepQualityByGender: buildGenderDistribution(
      inDept,
      (p) => sleepBucketFromApi(p.healthSpan.lifestyle?.sleep),
      [...SLEEP_BUCKETS],
    ),
    oxidativeStress: {
      department: deptSummary.name,
      low: percent(oxLow, oxTotal),
      moderate: percent(oxMod, oxTotal),
      high: percent(oxHigh, oxTotal),
      veryHigh: percent(oxVery, oxTotal),
    },
    companyScores: buildCompanyScores(inDept),
    kpis,
    participationByAge: AGE_GROUPS.map((ageGroup) => {
      const enrolled = inDept.filter((p) => p.ageGroup === ageGroup).length;
      return {
        ageGroup,
        enrolled: scaleDept(enrolled),
        percent: percent(enrolled, inDept.length),
      };
    }),
    overallRiskScore: (Object.keys(riskBands) as OverallRiskScoreBucket['band'][]).map((band) => ({
      band,
      count: scaleDept(riskBands[band]),
      percent: percent(riskBands[band], inDept.length),
    })),
    metabolicAgeCategories: [
      {
        key: 'good' as const,
        label: 'GOOD',
        count: scaleDept(metGood),
        percent: percent(metGood, inDept.length),
      },
      {
        key: 'attention' as const,
        label: 'NEEDS ATTENTION',
        count: scaleDept(metAttention),
        percent: percent(metAttention, inDept.length),
      },
      {
        key: 'highRisk' as const,
        label: 'HIGH RISK',
        count: scaleDept(metHigh),
        percent: percent(metHigh, inDept.length),
      },
    ],
  };
}
