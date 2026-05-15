import type { ToggleDimension } from '../types';

export function formatDimensionLabel(dimension: ToggleDimension): string {
  return dimension === 'gender' ? 'men and women' : 'departments';
}

export const CHART_INFO = {
  metabolicAge:
    'Distribution of employees by how far their metabolic age exceeds their actual age. A gap of 3 years or more defines the high-risk group used in your dashboard KPI.',

  positiveWins:
    'Strengths from this camp: disease areas where most employees are low risk, positive habits from lifestyle questionnaires, and blood test panels with the highest share of in-range results.',

  nutrition:
    'Workforce diet quality from the nutrition assessment. Each bar shows the percentage within, above, or below the recommended range for that macro or nutrient.',

  bmiWaist:
    'BMI categories from height and weight measurements, plus the share of employees whose waist circumference is above the healthy range for their profile.',

  diseaseDeepDive:
    'Select a condition to see what share of employees fall in each risk band: Healthy, Increased, High, or Very High. Use the Gender / Department toggle to compare groups.',

  oxidativeStress:
    'Oxidative stress measures cellular damage from free radicals. This chart shows severity bands by department so you can target wellness support where metabolic stress is highest.',

  bloodHeatmap:
    'Each cell shows the percentage of lab tests in that panel that fell within the clinical reference range for that department. Greener cells mean better results; paler or warmer tones need follow-up.',

  topAbnormalMarkers:
    'Lab tests most often outside reference ranges across all camp participants, ranked by abnormal rate. Use this to prioritise screening, supplements, or specialist referrals.',

  genderComparison:
    'Normalized health indices (0–100) comparing men and women. Higher values indicate greater concern for that metric and help tailor programmes by gender.',

  keyInsights:
    'Key patterns from this year’s camp—risk, lifestyle, labs, and demographics—plus recommended HR actions grouped by urgency (immediate, short-term, long-term).',

  departmentsOverview:
    'Enrollment and high metabolic-risk rates for every department. Select a department card above for detailed charts and insights.',

  deptTopRisks:
    'Share of employees in this department classified in elevated risk bands (Increased, High, or Very High) for each listed condition.',

  deptEnrollmentVsRisk:
    'Compares screening participation with the share in high metabolic risk (metabolic age at least 3 years above actual age) within this department.',

  historyHighRisk:
    'Percentage of camp participants flagged as high metabolic risk in each annual wellness camp. A downward trend suggests improving workforce health.',

  historyParticipation:
    'Number of employees who completed each annual wellness camp. Use this to track programme reach and plan future camp capacity.',

  interventions:
    'Suggested workforce wellness actions based on risk, lifestyle, and lab patterns from this camp. Impact estimates are illustrative for HR planning.',
} as const;

const LIFESTYLE_INFO: Record<string, string> = {
  'physical-activity':
    'Percentage of employees in each activity tier (Low, Moderate, High) from the lifestyle questionnaire. Compare across {segment} to identify groups needing movement programmes.',
  'sleep-quality':
    'Percentage reporting Poor, Average, or Sufficient sleep from the lifestyle questionnaire. Compare across {segment} to target sleep-health support.',
};

export function lifestyleInfo(itemId: string, itemTitle: string, dimension: ToggleDimension): string {
  const segment = formatDimensionLabel(dimension);
  const template =
    LIFESTYLE_INFO[itemId] ??
    `Percentage breakdown for ${itemTitle.toLowerCase()} from the lifestyle questionnaire, compared across ${segment}.`;
  return template.replace('{segment}', segment);
}

const BLOOD_PANEL_INFO: Record<string, string> = {
  b12: 'Vitamin B12 levels from blood tests. The ring shows the share of results within the normal reference range; the remainder may indicate deficiency or borderline levels.',
  d3: 'Vitamin D3 levels—often low in indoor and office roles with limited sun exposure. In-range percentage reflects workforce sufficiency for bone and immune health.',
  diabetes: 'Fasting glucose and related markers for diabetes and pre-diabetes risk. In-range share helps gauge metabolic health across the workforce.',
  lipid: 'Cholesterol panel (e.g. LDL, HDL, triglycerides) as a cardiovascular risk indicator. Shows how many results meet clinical reference ranges.',
  inflammatory: 'Inflammatory markers such as hs-CRP indicating systemic inflammation. Higher abnormal rates may warrant lifestyle or clinical follow-up.',
};

export function bloodPanelInfo(panelId: string, panelName: string): string {
  return (
    BLOOD_PANEL_INFO[panelId] ??
    `Summary of ${panelName} blood test results for enrolled employees. The ring shows the percentage within clinical reference ranges versus outside optimal range.`
  );
}
