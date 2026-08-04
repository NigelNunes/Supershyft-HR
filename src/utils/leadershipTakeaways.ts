import type {
  CompanyAverageScores,
  DiseaseRiskData,
  GenderDistributionPair,
  OverallRiskScoreBucket,
} from '../types';

export interface LeadershipTakeaway {
  id: string;
  title: string;
  headline: string;
  bullets: string[];
}

export interface LeadershipTakeawaysInput {
  overallRiskScore: OverallRiskScoreBucket[];
  companyScores: CompanyAverageScores | null;
  diseases: DiseaseRiskData[];
  physicalActivity: GenderDistributionPair;
  sleep: GenderDistributionPair;
}

const WORKFORCE_HEALTH_INSIGHTS = {
  excellent: {
    headline: 'Healthy Workforce',
    bullets: ['Strong preventive profile', 'Sustain current programs', 'Watch early warning signs'],
  },
  moderate: {
    headline: 'Emerging Health Risks',
    bullets: ['Moderate risk profile', 'Early action advised', 'Prevent future costs'],
  },
  high: {
    headline: 'Growing Disease Burden',
    bullets: ['Elevated risk prevalence', 'Org-wide lifestyle focus', 'Reduce chronic disease load'],
  },
  critical: {
    headline: 'Immediate Leadership Action Required',
    bullets: ['Critical risk exposure', 'Act on productivity impact', 'Contain healthcare spend'],
  },
} as const;

const LIFESTYLE_INSIGHTS = {
  physical: {
    headline: 'Movement Opportunity',
    bullets: ['Low daily activity', 'Increase active minutes', 'Improve metabolic health'],
  },
  sleep: {
    headline: 'Recovery Opportunity',
    bullets: ['Sleep quality gap', 'Prioritize recovery habits', 'Boost cognitive performance'],
  },
  bothPoor: {
    headline: 'Lifestyle Reset Needed',
    bullets: ['Inactivity and poor sleep', 'Address both drivers together', 'Maximize health impact'],
  },
  bothGood: {
    headline: 'Healthy Lifestyle Foundation',
    bullets: ['Strong movement habits', 'Solid recovery patterns', 'Support higher-risk cohorts'],
  },
} as const;

const DISEASE_FOCUS_INSIGHTS = {
  metabolic: {
    headline: 'Metabolic Health Priority',
    bullets: ['Lifestyle-driven risks', 'Nutrition and exercise first', 'Weight management focus'],
  },
  cardiovascular: {
    headline: 'Heart Health Priority',
    bullets: ['BP and cardiac flags', 'Increase regular screening', 'Stress management programs'],
  },
  hormonal: {
    headline: 'Hormonal Health Opportunity',
    bullets: ['Personalized screening', 'Specialist support pathways', 'Improve long-term wellbeing'],
  },
  distributed: {
    headline: 'Preventive Healthcare Focus',
    bullets: ['No dominant disease', 'Broad preventive approach', 'Workforce-wide impact'],
  },
} as const;

const STRATEGIC_INSIGHTS = {
  low: {
    headline: 'Maintain Momentum',
    bullets: ['Keep annual assessments', 'Reward healthy behaviours', 'Protect current gains'],
  },
  moderate: {
    headline: 'Target High-Risk Employees',
    bullets: ['Identify high-risk groups', 'Prioritize personalized care', 'Monitor health progress'],
  },
  high: {
    headline: 'Scale Preventive Care',
    bullets: ['Expand clinical support', 'Pair fitness and nutrition', 'Drive digital engagement'],
  },
  critical: {
    headline: 'Build a Long-Term Health Strategy',
    bullets: ['Integrate regular screenings', 'Engage leadership visibly', 'Track outcomes over time'],
  },
} as const;

const METABOLIC_CODES = new Set([
  'type_2_diabetes',
  'obesity',
  'nafld',
  'dyslipidemia',
  'metabolic_syndrome',
]);
const CARDIOVASCULAR_CODES = new Set(['hypertension', 'cardiac_health']);
const HORMONAL_CODES = new Set(['pcos_pcod', 'thyroid_health']);

const PHYSICAL_POOR_LABELS = new Set(['Less than 30mins', 'Rarely or Never']);
const SLEEP_POOR_LABELS = new Set(['Less than 5']);

function elevatedRiskPercent(buckets: OverallRiskScoreBucket[]): number {
  return buckets
    .filter((bucket) => bucket.band === 'Increased Risk' || bucket.band === 'High risk')
    .reduce((sum, bucket) => sum + bucket.percent, 0);
}

function workforceRiskBand(elevatedPercent: number): keyof typeof WORKFORCE_HEALTH_INSIGHTS {
  if (elevatedPercent <= 20) return 'excellent';
  if (elevatedPercent <= 40) return 'moderate';
  if (elevatedPercent <= 60) return 'high';
  return 'critical';
}

function strategicBand(elevatedPercent: number): keyof typeof STRATEGIC_INSIGHTS {
  if (elevatedPercent <= 20) return 'low';
  if (elevatedPercent <= 40) return 'moderate';
  if (elevatedPercent <= 60) return 'high';
  return 'critical';
}

function averagePoorPercent(
  data: GenderDistributionPair,
  poorLabels: Set<string>,
): number | null {
  const sides = [data.male, data.female].filter((side) => side.length > 0);
  if (sides.length === 0) return null;

  const poorPercents = sides.map((side) =>
    side
      .filter((slice) => poorLabels.has(slice.label))
      .reduce((sum, slice) => sum + slice.percent, 0),
  );

  return poorPercents.reduce((sum, value) => sum + value, 0) / poorPercents.length;
}

function lifestyleBand(
  physical: GenderDistributionPair,
  sleep: GenderDistributionPair,
  companyScores: CompanyAverageScores | null,
): keyof typeof LIFESTYLE_INSIGHTS {
  const physicalPoor = averagePoorPercent(physical, PHYSICAL_POOR_LABELS);
  const sleepPoor = averagePoorPercent(sleep, SLEEP_POOR_LABELS);

  const physicalScore = companyScores?.fitness ?? null;
  const lifestyleScore = companyScores?.lifestyle ?? null;

  const physicalWeak =
    physicalPoor != null ? physicalPoor >= 40 : physicalScore != null ? physicalScore < 60 : null;
  const sleepWeak =
    sleepPoor != null ? sleepPoor >= 40 : lifestyleScore != null ? lifestyleScore < 60 : null;

  const physicalStrong =
    physicalPoor != null ? physicalPoor < 30 : physicalScore != null ? physicalScore >= 70 : null;
  const sleepStrong =
    sleepPoor != null ? sleepPoor < 30 : lifestyleScore != null ? lifestyleScore >= 70 : null;

  if (physicalWeak && sleepWeak) return 'bothPoor';
  if (physicalStrong && sleepStrong) return 'bothGood';

  const physicalSignal = physicalPoor ?? (physicalScore != null ? 100 - physicalScore : 50);
  const sleepSignal = sleepPoor ?? (lifestyleScore != null ? 100 - lifestyleScore : 50);

  return physicalSignal >= sleepSignal ? 'physical' : 'sleep';
}

function diseaseElevatedPercent(disease: DiseaseRiskData): number {
  const elevatedLevels = new Set(['Increased', 'High', 'Very High']);
  const elevatedBuckets = disease.buckets.filter((bucket) => elevatedLevels.has(bucket.level));
  if (elevatedBuckets.length === 0) return 0;

  const values = elevatedBuckets.flatMap((bucket) => Object.values(bucket.segments));
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function categoryBurden(diseases: DiseaseRiskData[], codes: Set<string>): number {
  const inCategory = diseases.filter((disease) => codes.has(disease.disease.code));
  if (inCategory.length === 0) return 0;
  return inCategory.reduce((sum, disease) => sum + diseaseElevatedPercent(disease), 0) / inCategory.length;
}

function diseaseFocusBand(diseases: DiseaseRiskData[]): keyof typeof DISEASE_FOCUS_INSIGHTS {
  if (diseases.length === 0) return 'distributed';

  const metabolic = categoryBurden(diseases, METABOLIC_CODES);
  const cardiovascular = categoryBurden(diseases, CARDIOVASCULAR_CODES);
  const hormonal = categoryBurden(diseases, HORMONAL_CODES);

  const scores = [
    { key: 'metabolic' as const, value: metabolic },
    { key: 'cardiovascular' as const, value: cardiovascular },
    { key: 'hormonal' as const, value: hormonal },
  ].sort((a, b) => b.value - a.value);

  const [top, second] = scores;
  if (top.value < 30 || top.value - second.value < 8) return 'distributed';
  return top.key;
}

function toTakeaway(
  id: string,
  title: string,
  insight: { headline: string; bullets: readonly string[] },
): LeadershipTakeaway {
  return { id, title, headline: insight.headline, bullets: [...insight.bullets] };
}

export function buildLeadershipTakeaways(input: LeadershipTakeawaysInput): LeadershipTakeaway[] {
  const elevatedPercent = elevatedRiskPercent(input.overallRiskScore);
  const workforceBand = workforceRiskBand(elevatedPercent);
  const strategyBand = strategicBand(elevatedPercent);
  const lifestyle = lifestyleBand(input.physicalActivity, input.sleep, input.companyScores);
  const diseaseFocus = diseaseFocusBand(input.diseases);

  return [
    toTakeaway('workforce-health', 'Workforce Health Status', WORKFORCE_HEALTH_INSIGHTS[workforceBand]),
    toTakeaway('lifestyle-priority', 'Lifestyle Priority', LIFESTYLE_INSIGHTS[lifestyle]),
    toTakeaway('disease-focus', 'Primary Disease Focus', DISEASE_FOCUS_INSIGHTS[diseaseFocus]),
    toTakeaway('strategic-next-step', 'Strategic Next Step', STRATEGIC_INSIGHTS[strategyBand]),
  ];
}
