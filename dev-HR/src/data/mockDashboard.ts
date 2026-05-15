import type {
  DashboardData,
  DepartmentDetail,
  DiseaseRiskData,
  RiskLevel,
  ToggleDimension,
} from '../types';
import { DISEASES } from './diseases';

const DEPARTMENTS = ['Technology', 'R&D', 'Sales', 'Operations', 'Finance', 'HR', 'Marketing'];

const GENDER_KEYS = ['Male', 'Female'];
const DEPT_KEYS = DEPARTMENTS;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function distribute(total: number, parts: number, rand: () => number): number[] {
  const raw = Array.from({ length: parts }, () => rand());
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const vals = raw.map((v) => Math.round((v / sum) * total));
  const diff = total - vals.reduce((a, b) => a + b, 0);
  vals[0] += diff;
  return vals;
}

function buildBuckets(
  rand: () => number,
  keys: string[],
): { level: RiskLevel; segments: Record<string, number> }[] {
  const levels: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];
  return levels.map((level) => {
    const base =
      level === 'Healthy' ? 55 + rand() * 25 : level === 'Increased' ? 8 + rand() * 12 : level === 'High' ? 3 + rand() * 8 : 1 + rand() * 4;
    const parts = distribute(Math.round(base), keys.length, rand);
    const segments: Record<string, number> = {};
    keys.forEach((k, i) => {
      segments[k] = parts[i];
    });
    return { level, segments };
  });
}

function buildDiseaseData(seed: number, keys: string[]): DiseaseRiskData[] {
  return DISEASES.map((disease, i) => {
    const r = seeded(seed + i * 97);
    const buckets = buildBuckets(r, keys);
    const healthy = buckets.find((b) => b.level === 'Healthy');
    const healthySum = healthy
      ? Object.values(healthy.segments).reduce((a, b) => a + b, 0)
      : 0;
    const overallStatus: RiskLevel =
      healthySum >= 75 ? 'Healthy' : healthySum >= 55 ? 'Increased' : healthySum >= 40 ? 'High' : 'Very High';
    return { disease, buckets, overallStatus };
  });
}

const employees = (() => {
  const names = [
    ['Arjun', 'Mehta', 'Male', 'O+', 'Technology'],
    ['Priya', 'Sharma', 'Female', 'B+', 'R&D'],
    ['Rahul', 'Kapoor', 'Male', 'A+', 'Sales'],
    ['Ananya', 'Iyer', 'Female', 'AB+', 'Operations'],
    ['Vikram', 'Singh', 'Male', 'B-', 'Finance'],
    ['Neha', 'Patel', 'Female', 'O-', 'HR'],
    ['Karan', 'Desai', 'Male', 'A-', 'Marketing'],
    ['Sneha', 'Reddy', 'Female', 'B+', 'Technology'],
    ['Amit', 'Joshi', 'Male', 'O+', 'R&D'],
    ['Divya', 'Nair', 'Female', 'A+', 'Sales'],
    ['Rohan', 'Gupta', 'Male', 'AB-', 'Operations'],
    ['Kavya', 'Menon', 'Female', 'O+', 'Finance'],
  ];
  return names.map(([first, last, gender, bg, dept], i) => ({
    id: `emp-${i + 1}`,
    name: `${first} ${last}`,
    phone: `98${String(10000000 + i * 111111).slice(0, 8)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@company.com`,
    bloodGroup: bg,
    department: dept,
    gender: gender as 'Male' | 'Female',
  }));
})();

const oxidativeByDept = DEPARTMENTS.map((department, i) => {
  const r = seeded(400 + i);
  const high = Math.round(8 + r() * 18);
  const veryHigh = Math.round(2 + r() * 8);
  const moderate = Math.round(15 + r() * 20);
  const low = 100 - high - veryHigh - moderate;
  return { department, low, moderate, high, veryHigh };
});

export const mockDashboard: DashboardData = {
  org: {
    organizationId: 1,
    hasHistory: true,
    campYear: 2024,
  },
  hr: {
    name: 'Neha Patel',
    phone: '+91 98765 43210',
    companyName: 'DeDecor',
    companyLogo: undefined,
  },
  kpis: {
    totalEmployees: 1240,
    enrolledForTest: 1086,
    highRiskGroup: 310,
    enrolledForDoctorConsultation: 248,
  },
  diseases: buildDiseaseData(42, GENDER_KEYS),
  lifestyle: [
    {
      id: 'physical-activity',
      title: 'Physical Activity Levels',
      buckets: [
        { label: 'Low', segments: { Male: 75, Female: 53 } },
        { label: 'Moderate', segments: { Male: 18, Female: 32 } },
        { label: 'High', segments: { Male: 7, Female: 15 } },
      ],
      insight: {
        tone: 'concern',
        text: '75% of men and 53% of women have low physical activity levels.',
      },
    },
    {
      id: 'sleep-quality',
      title: 'Sleep Quality',
      buckets: [
        { label: 'Poor', segments: { Male: 28, Female: 12 } },
        { label: 'Average', segments: { Male: 25, Female: 9 } },
        { label: 'Sufficient', segments: { Male: 47, Female: 79 } },
      ],
      insight: {
        tone: 'positive',
        text: '79% of women and 47% of men report sufficient sleep quality.',
      },
    },
  ],
  oxidativeStress: oxidativeByDept,
  bloodPanels: [
    { id: 'b12', name: 'Vitamin B12', abnormalPercent: 34, inRangePercent: 66, topConcern: 'Deficiency in R&D and Sales' },
    { id: 'd3', name: 'Vitamin D3', abnormalPercent: 41, inRangePercent: 59, topConcern: 'Low levels across indoor roles' },
    { id: 'diabetes', name: 'Diabetes', abnormalPercent: 22, inRangePercent: 78, topConcern: 'Pre-diabetic trend in Operations' },
    { id: 'lipid', name: 'Lipid', abnormalPercent: 29, inRangePercent: 71, topConcern: 'Elevated LDL in male cohort' },
    { id: 'inflammatory', name: 'Inflammatory', abnormalPercent: 18, inRangePercent: 82, topConcern: 'Hs-CRP elevation in Sales' },
  ],
  genderComparison: [
    { metric: 'Metabolic risk', male: 68, female: 45 },
    { metric: 'Thyroid', male: 22, female: 38 },
    { metric: 'Hemoglobin', male: 78, female: 52 },
    { metric: 'Stress index', male: 60, female: 48 },
    { metric: 'Cardiac risk', male: 55, female: 32 },
  ],
  metabolicAge: {
    buckets: [
      { label: 'On track (0–2 yrs gap)', count: 612, percent: 56, isHighRisk: false },
      { label: 'Watch (2–3 yrs gap)', count: 164, percent: 15, isHighRisk: false },
      { label: 'High risk (3+ yrs gap)', count: 310, percent: 29, isHighRisk: true },
    ],
    avgGapYears: 2.4,
    highRiskPercent: 29,
  },
  positiveWins: {
    lowRisk: [
      { code: 'thyroid_health', name: 'Thyroid Health', riskStatus: 'Healthy' },
      { code: 'hypertension', name: 'Hypertension', riskStatus: 'Healthy' },
      { code: 'metabolic_syndrome', name: 'Metabolic Syndrome', riskStatus: 'Healthy' },
    ],
    healthyHabits: [
      { habitLabel: 'Regular physical activity' },
      { habitLabel: 'Adequate sleep (7–9 hrs)' },
      { habitLabel: 'Low alcohol consumption' },
    ],
    healthyProfiles: ['Thyroid panel', 'Kidney function', 'Complete blood count'],
  },
  nutrition: {
    avgScore: 3.6,
    riskBand: 'Moderate',
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
  bloodGroupHeatmap: DEPARTMENTS.map((department, i) => {
    const r = seeded(600 + i);
    const groups: Record<string, number> = {};
    ['Lipid', 'Diabetes', 'Thyroid', 'Vitamin', 'Liver', 'Kidney', 'Inflammatory'].forEach((g) => {
      groups[g] = Math.round(55 + r() * 40);
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
  keyInsights: {
    insightCards: [
      {
        id: 'growth',
        title: 'Participant growth',
        variant: 'blue',
        bullets: [
          '1,086 employees completed the 2024 camp (+15% vs 2023).',
          'Enrollment rate reached 88%, up from 76% last year.',
          'Technology and R&D show highest first-time participation.',
        ],
      },
      {
        id: 'risk',
        title: 'Overall risk intensification',
        variant: 'red',
        bullets: [
          '29% of workforce has metabolic age ≥3 years above chronological age.',
          'Dyslipidemia and Type 2 Diabetes show the largest elevated-risk segments.',
          'Male employees index 23 points higher on composite metabolic risk.',
        ],
      },
      {
        id: 'oxidative',
        title: 'Oxidative stress',
        variant: 'orange',
        bullets: [
          'Sales department shows highest combined High/Very High burden (26%).',
          'Organisation-wide, 11% fall in the Very High oxidative stress band.',
          'Correlates with low activity and poor sleep in the same cohorts.',
        ],
      },
      {
        id: 'positive',
        title: 'Positive trends',
        variant: 'green',
        bullets: [
          'Thyroid, hypertension, and metabolic syndrome lead low-risk disease wins.',
          'Kidney function and CBC groups rank highest for in-range blood profiles.',
          'High-risk metabolic share declined from 31% (2022) to 25% (2024).',
        ],
      },
      {
        id: 'lifestyle',
        title: 'Lifestyle factors',
        variant: 'purple',
        bullets: [
          '75% of men report low physical activity vs 53% of women.',
          '79% of women report sufficient sleep; only 47% of men do.',
          'Sedentary sitting (1–4 hrs) reported by 58% of desk-based roles.',
        ],
      },
      {
        id: 'gender',
        title: 'Gender-specific patterns',
        variant: 'pink',
        bullets: [
          'Women show higher thyroid risk index; men higher cardiac and lipid indices.',
          'Hemoglobin in-range rate is 26 points higher in men than women.',
          'PCOS/PCOD indicators concentrated in female cohort under age 40.',
        ],
      },
      {
        id: 'emerging',
        title: 'Emerging risks',
        variant: 'yellow',
        bullets: [
          'Pre-diabetic HbA1c trend rising in Operations (+4% vs last camp).',
          'Vitamin D deficiency clusters in indoor / R&D roles.',
          'Early NAFLD signals in male employees aged 35–45.',
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
          'Book cardiac and lipid screening for top 15% dyslipidemia-risk employees.',
          'Roll out Vitamin D & B12 supplementation pilot for deficient cohorts.',
          'Mandate doctor consultations for all metabolic age ≥3 years gap.',
        ],
      },
      {
        id: 'short',
        title: 'Short-term',
        timeframe: '3–6 months',
        variant: 'short',
        items: [
          'Department-level nutrition coaching (focus: fibre and hydration).',
          'Sleep hygiene workshops for male employees and shift workers.',
          'Introduce movement-break policy for sedentary desk roles.',
          'Quarterly oxidative stress re-screen for high-burden departments.',
        ],
      },
      {
        id: 'long',
        title: 'Long-term',
        timeframe: '6–12 months',
        variant: 'long',
        items: [
          'Establish comprehensive annual wellness programme with YoY tracking.',
          'On-site fitness facilities or subsidised memberships for low-activity groups.',
          'Integrate health metrics into manager dashboards (anonymised aggregates).',
          'Partner with nutritionists for sustained macro-balance improvement goals.',
        ],
      },
    ],
  },
  interventions: [
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
  ],
  departments: DEPARTMENTS.map((name, i) => {
    const r = seeded(200 + i);
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      headcount: Math.round(80 + r() * 220),
      enrolledPercent: Math.round(82 + r() * 15),
      highRiskPercent: Math.round(18 + r() * 20),
    };
  }),
  employees: [...employees, ...Array.from({ length: 28 }, (_, i) => {
    const r = seeded(500 + i);
    const dept = DEPARTMENTS[Math.floor(r() * DEPARTMENTS.length)];
    const g = r() > 0.5 ? 'Male' : 'Female';
    return {
      id: `emp-${i + 13}`,
      name: `Employee ${i + 13}`,
      phone: `99${String(20000000 + i * 333333).slice(0, 8)}`,
      email: `employee${i + 13}@company.com`,
      bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-'][Math.floor(r() * 5)],
      department: dept,
      gender: g as 'Male' | 'Female',
    };
  })],
  history: [
    { id: 'h1', year: 2024, label: 'Annual Wellness Camp 2024', participants: 1086, highRiskPercent: 25, enrolledPercent: 88 },
    { id: 'h2', year: 2023, label: 'Annual Wellness Camp 2023', participants: 942, highRiskPercent: 28, enrolledPercent: 76 },
    { id: 'h3', year: 2022, label: 'Pilot Health Camp 2022', participants: 410, highRiskPercent: 31, enrolledPercent: 62 },
  ],
};

export function getDashboardForToggle(dimension: ToggleDimension): Pick<DashboardData, 'diseases' | 'lifestyle'> {
  const keys = dimension === 'gender' ? GENDER_KEYS : DEPT_KEYS.slice(0, 4);
  return {
    diseases: buildDiseaseData(dimension === 'gender' ? 42 : 99, keys),
    lifestyle: mockDashboard.lifestyle.map((item, idx) => ({
      ...item,
      buckets: item.buckets.map((b) => ({
        ...b,
        segments: Object.fromEntries(
          keys.map((k, i) => [k, Math.max(5, Math.round((b.segments[GENDER_KEYS[i % 2]] ?? 30) * (0.7 + seeded(idx * 11 + i)() * 0.6)))]),
        ),
      })),
    })),
  };
}

export function getDepartmentDetail(id: string): DepartmentDetail | null {
  const dept = mockDashboard.departments.find((d) => d.id === id);
  if (!dept) return null;
  const ox = mockDashboard.oxidativeStress.find((o) => o.department === dept.name) ?? mockDashboard.oxidativeStress[0];
  const r = seeded(dept.name.length * 17);
  return {
    ...dept,
    kpis: [
      { label: 'Enrolled', value: `${dept.enrolledPercent}%`, sub: 'of department' },
      { label: 'High metabolic risk', value: `${dept.highRiskPercent}%`, sub: 'metabolic age ≥3 yrs above actual' },
      { label: 'Doctor consults', value: String(Math.round(dept.headcount * 0.18)), sub: 'booked' },
      { label: 'Avg sleep quality', value: r() > 0.5 ? 'Sufficient' : 'Average', sub: 'self-reported' },
    ],
    riskHighlights: [
      { disease: 'Type 2 Diabetes', percent: Math.round(12 + r() * 15) },
      { disease: 'Dyslipidemia', percent: Math.round(18 + r() * 12) },
      { disease: 'Hypertension', percent: Math.round(8 + r() * 10) },
    ],
    lifestyleInsight: `${dept.name} shows ${r() > 0.5 ? 'below-average physical activity' : 'moderate activity'} with ${Math.round(20 + r() * 25)}% reporting poor sleep.`,
    oxidativeStress: ox,
  };
}

export const DEMO_PHONE = '0000000000';
export const DEMO_OTP = '000000';
