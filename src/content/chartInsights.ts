import type { DistributionSlice, GenderDistributionPair, LifestyleGenderView, TopHighRiskDisease } from '../types';
import { DISEASES } from '../data/diseases';

export type InsightTone = 'concern' | 'positive' | 'neutral';

export interface ChartInsight {
  tone: InsightTone;
  text: string;
}

export interface LifestyleChartInsight {
  tone: InsightTone;
  concern: string;
  actionableInsight: string;
}

const POOR_ACTIVITY_LABELS = ['Less than 30mins', 'Rarely or Never'];
const POOR_SLEEP_LABELS = ['Less than 5', '5-7', 'More than 9'];

function formatElevatedPercent(percent: number): string {
  const display = Math.round(percent * 10) / 10;
  return `${display}%`;
}

function sumPercentForLabels(slices: DistributionSlice[], labels: string[]): number {
  return slices
    .filter((slice) => labels.includes(slice.label))
    .reduce((sum, slice) => sum + slice.percent, 0);
}

function lifestyleInsightText(insight: LifestyleChartInsight): string {
  return `${insight.concern} ${insight.actionableInsight}`;
}

export function toChartInsight(insight: LifestyleChartInsight): ChartInsight {
  return { tone: insight.tone, text: lifestyleInsightText(insight) };
}

export function computePoorActivityPercent(
  data: GenderDistributionPair,
  view: LifestyleGenderView,
  genderWeights?: { male?: number; female?: number },
): number {
  const malePoor = sumPercentForLabels(data.male, POOR_ACTIVITY_LABELS);
  const femalePoor = sumPercentForLabels(data.female, POOR_ACTIVITY_LABELS);

  if (view === 'male') return malePoor;
  if (view === 'female') return femalePoor;

  const maleWeight = genderWeights?.male ?? 1;
  const femaleWeight = genderWeights?.female ?? 1;
  const totalWeight = maleWeight + femaleWeight;
  if (totalWeight === 0) return 0;

  return (malePoor * maleWeight + femalePoor * femaleWeight) / totalWeight;
}

export function computePoorSleepPercent(
  data: GenderDistributionPair,
  view: LifestyleGenderView,
  genderWeights?: { male?: number; female?: number },
): number {
  const malePoor = sumPercentForLabels(data.male, POOR_SLEEP_LABELS);
  const femalePoor = sumPercentForLabels(data.female, POOR_SLEEP_LABELS);

  if (view === 'male') return malePoor;
  if (view === 'female') return femalePoor;

  const maleWeight = genderWeights?.male ?? 1;
  const femaleWeight = genderWeights?.female ?? 1;
  const totalWeight = maleWeight + femaleWeight;
  if (totalWeight === 0) return 0;

  return (malePoor * maleWeight + femalePoor * femaleWeight) / totalWeight;
}

export function getPhysicalActivityConcernInsight(poorActivityPercent: number): LifestyleChartInsight {
  if (poorActivityPercent < 30) {
    return {
      tone: 'positive',
      concern:
        'Most employees engage in regular physical activity, supporting healthy metabolism, cardiovascular health, and overall wellbeing.',
      actionableInsight:
        'Continue promoting active lifestyles through fitness challenges and wellness initiatives.',
    };
  }

  if (poorActivityPercent < 50) {
    return {
      tone: 'concern',
      concern:
        'A considerable proportion of employees report low physical activity, indicating opportunities to improve daily movement and reduce future metabolic risk.',
      actionableInsight:
        'Encourage walking meetings, post-lunch walks, and workplace fitness programmes.',
    };
  }

  if (poorActivityPercent < 70) {
    return {
      tone: 'concern',
      concern:
        'Low physical activity is common across the workforce, increasing the likelihood of obesity, diabetes, and cardiovascular disease over time.',
      actionableInsight:
        'Prioritize structured fitness initiatives, activity challenges, and personalized coaching.',
    };
  }

  return {
    tone: 'concern',
    concern:
      'Sedentary behaviour is widespread, placing a significant portion of employees at increased metabolic risk. Immediate interventions to promote regular movement are recommended.',
    actionableInsight:
      'Launch organization-wide physical activity programmes with regular participation tracking.',
  };
}

export function getSleepConcernInsight(poorSleepPercent: number): LifestyleChartInsight {
  if (poorSleepPercent < 30) {
    return {
      tone: 'positive',
      concern:
        'Most employees achieve the recommended 7–9 hours of sleep, supporting recovery, productivity, and long-term health.',
      actionableInsight: 'Reinforce healthy sleep habits through wellbeing programmes.',
    };
  }

  if (poorSleepPercent < 50) {
    return {
      tone: 'concern',
      concern:
        'A sizable proportion of employees sleep less than the recommended duration, potentially affecting energy, focus, and recovery.',
      actionableInsight: 'Promote sleep hygiene education and work-life balance initiatives.',
    };
  }

  if (poorSleepPercent < 70) {
    return {
      tone: 'concern',
      concern:
        'Poor sleep habits are common across the workforce, increasing the risk of fatigue, stress, and metabolic disorders.',
      actionableInsight:
        'Encourage flexible work practices, recovery programmes, and sleep awareness sessions.',
    };
  }

  return {
    tone: 'concern',
    concern:
      'Insufficient sleep is widespread, potentially impacting employee wellbeing, cognitive performance, and long-term health outcomes.',
    actionableInsight:
      'Make sleep health a priority through organization-wide wellbeing interventions and regular monitoring.',
  };
}

function diseaseCodeFromName(name: string) {
  const normalized = name.trim().toLowerCase();
  return DISEASES.find((disease) => disease.name.toLowerCase() === normalized)?.code ?? null;
}

export function getTopDiseaseRiskConcernInsight(
  disease: Pick<TopHighRiskDisease, 'name' | 'highRiskPercent'>,
  insightPrefix = 'employees',
): ChartInsight {
  const riskPct = formatElevatedPercent(disease.highRiskPercent);
  const code = diseaseCodeFromName(disease.name);

  switch (code) {
    case 'type_2_diabetes':
      return {
        tone: 'concern',
        text: `Type 2 Diabetes leads with ${riskPct} of employees in elevated risk bands — prioritize blood sugar screening, nutrition coaching, and lifestyle interventions to prevent progression to diabetes.`,
      };
    case 'hypertension':
      return {
        tone: 'concern',
        text: `Hypertension leads with ${riskPct} of employees in elevated risk bands — prioritize blood pressure monitoring, stress management, and cardiovascular risk reduction programmes.`,
      };
    case 'obesity':
      return {
        tone: 'concern',
        text: `Obesity leads with ${riskPct} of employees in elevated risk bands — prioritize weight management, physical activity initiatives, and nutrition counselling to reduce future metabolic disease risk.`,
      };
    case 'dyslipidemia':
      return {
        tone: 'concern',
        text: `Dyslipidemia leads with ${riskPct} of employees in elevated risk bands — prioritize lipid screening, heart-healthy nutrition, and targeted interventions to lower cardiovascular risk.`,
      };
    case 'nafld':
      return {
        tone: 'concern',
        text: `NAFLD leads with ${riskPct} of employees in elevated risk bands — prioritize weight management, dietary improvements, and metabolic health interventions to reduce liver disease risk.`,
      };
    case 'cardiac_health':
      return {
        tone: 'concern',
        text: `Cardiovascular risk leads with ${riskPct} of employees in elevated risk bands — prioritize comprehensive cardiac screening, lifestyle modification, and physician consultations.`,
      };
    case 'thyroid_health':
      return {
        tone: 'concern',
        text: `Thyroid health risk leads with ${riskPct} of employees in elevated risk bands — prioritize thyroid function screening and timely clinical evaluation to improve metabolic and hormonal health.`,
      };
    case 'pcos_pcod':
      return {
        tone: 'concern',
        text: `PCOS/PCOD risk affects ${riskPct} of female employees in elevated risk bands — prioritize women's health consultations, hormonal assessments, and personalized lifestyle support.`,
      };
    default:
      return {
        tone: 'concern',
        text: `${disease.name} leads with ${riskPct} of ${insightPrefix} in elevated risk bands — prioritize screening and targeted interventions.`,
      };
  }
}

export function getOxidativeStressConcernInsight(elevatedPercent: number): ChartInsight {
  if (elevatedPercent <= 10) {
    return {
      tone: 'positive',
      text: 'Oxidative stress levels remain well controlled across the workforce, indicating healthy recovery, balanced lifestyle habits, and good cellular resilience. Continue promoting healthy nutrition, regular exercise, and adequate sleep.',
    };
  }

  if (elevatedPercent <= 25) {
    return {
      tone: 'concern',
      text: 'A portion of employees show elevated oxidative stress, suggesting early signs of lifestyle-related strain. Addressing recovery, nutrition, and stress management can help prevent long-term health impacts. Encourage antioxidant-rich nutrition, regular movement, and healthy sleep habits.',
    };
  }

  if (elevatedPercent <= 50) {
    return {
      tone: 'concern',
      text: 'Elevated oxidative stress affects a significant share of employees, indicating increased cellular stress that may contribute to fatigue, reduced cognitive performance, and chronic disease risk if left unmanaged. Prioritize stress management, recovery programmes, nutrition counselling, and wellbeing initiatives.',
    };
  }

  return {
    tone: 'concern',
    text: 'Oxidative stress is widespread across the workforce, suggesting poor recovery and increased vulnerability to burnout, inflammation, and chronic disease. Immediate organization-wide wellbeing interventions are recommended. Implement comprehensive recovery programmes, lifestyle coaching, and repeat health assessments.',
  };
}

export function getOverallRiskConcernInsight(elevatedPercent: number): ChartInsight {
  const pct = formatElevatedPercent(elevatedPercent);

  if (elevatedPercent <= 20) {
    return {
      tone: 'positive',
      text: `Excellent workforce health. Only ${pct} of employees fall within the Increased Risk or High Risk bands, indicating a predominantly healthy workforce. Continue preventive wellness initiatives and routine health monitoring to sustain these positive outcomes.`,
    };
  }

  if (elevatedPercent <= 40) {
    return {
      tone: 'concern',
      text: `Moderate health concern. ${pct} of employees fall within the Increased Risk or High Risk bands. Targeted lifestyle interventions, personalized wellness programs, and doctor consultations are recommended to prevent progression to chronic health conditions.`,
    };
  }

  if (elevatedPercent <= 60) {
    return {
      tone: 'concern',
      text: `High workforce risk. ${pct} of employees are classified in the Increased Risk or High Risk bands, suggesting a significant portion of the workforce would benefit from proactive health interventions. Prioritize comprehensive wellness programs, nutrition guidance, and clinical follow-ups to improve health outcomes.`,
    };
  }

  if (elevatedPercent <= 80) {
    return {
      tone: 'concern',
      text: `Critical health priority. ${pct} of employees are at elevated health risk, indicating widespread metabolic and lifestyle concerns across the organization. Immediate organization-wide preventive healthcare initiatives, personalized coaching, and medical outreach should be prioritized.`,
    };
  }

  return {
    tone: 'concern',
    text: `Urgent organizational intervention required. ${pct} of employees fall within the Increased Risk or High Risk bands, representing a substantial health burden. A comprehensive preventive health strategy, regular clinical monitoring, and targeted disease management programs are essential to reduce future healthcare costs and improve workforce wellbeing.`,
  };
}
