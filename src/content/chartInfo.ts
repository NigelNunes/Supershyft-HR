import type { ToggleDimension } from '../types';

export function formatDimensionLabel(dimension: ToggleDimension): string {
  return dimension === 'gender' ? 'men and women' : 'departments';
}

export const CHART_INFO = {
  participationByAge:
    'Number and share of employees who completed the wellness camp, broken down by age group. Helps HR target outreach to under-represented cohorts.',

  topHighRiskDiseases:
    'The three disease areas with the highest average elevated-risk share (Increased, High, or Very High) across all tested employees.',

  companyScores:
    'Company-wide average scores from nutrition, fitness, and lifestyle assessments (health-span-index, scale 0–100). Higher is better.',

  deptPhysicalPie:
    'Share of employees by daily activity: less than 30 mins, 30–60 mins, more than 60 mins, or rarely/never.',

  deptSleepPie:
    'Share of employees by nightly sleep: less than 5 hrs, 5–7 hrs, 7–9 hrs, or more than 9 hrs.',

  overallRiskScore:
    'Composite workforce risk profile aggregated into four bands: Optimal, Low risk, Increased Risk, and High risk.',

  physicalActivityPie:
    'Physical activity distribution (less than 30 mins, 30–60 mins, more than 60 mins, rarely/never) from FitPrint lifestyle data, by gender.',

  sleepQualityPie:
    'Sleep duration (less than 5, 5–7, 7–9, more than 9 hours) from FitPrint lifestyle data, by gender.',

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
    'Oxidative stress measures cellular damage from free radicals. This chart shows company-wide severity bands (Low, Moderate, High, Very High) so you can gauge overall workforce metabolic stress.',

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

  deptTopDiseases:
    'Top three disease areas with the highest elevated-risk share within this department, aligned with the main dashboard high-risk view.',

  deptLifestyleAverages:
    'Department-wide distribution of physical activity levels and sleep hours from FitPrint lifestyle data.',

  deptOxidativePie:
    'Distribution of oxidative stress severity bands within this department: Low, Moderate, High, and Very High.',

  deptCompanyScores:
    'Average nutrition, fitness, and lifestyle scores for employees in this department (scale 0–100).',

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

  executiveRanking:
    'National and industry standing for this organization versus peer companies, plus city-level ranks on the map. Lower rank numbers indicate stronger relative performance.',
} as const;

const LIFESTYLE_INFO: Record<string, string> = {
  'physical-activity':
    'Percentage in each activity band (less than 30 mins, 30–60 mins, more than 60 mins, rarely/never). Compare across {segment} to target movement programmes.',
  'sleep-quality':
    'Percentage by sleep hours (less than 5, 5–7, 7–9, more than 9). Compare across {segment} to target sleep-health support.',
};

export function lifestyleInfo(itemId: string, itemTitle: string, dimension: ToggleDimension): string {
  const segment = formatDimensionLabel(dimension);
  const template =
    LIFESTYLE_INFO[itemId] ??
    `Percentage breakdown for ${itemTitle.toLowerCase()} from the lifestyle questionnaire, compared across ${segment}.`;
  return template.replace('{segment}', segment);
}

const BLOOD_PANEL_INFO: Record<string, string> = {
  b12: 'Vitamin B12 levels from blood tests. Each lit dot represents about 5% of results within the normal reference range; empty dots are outside optimal range.',
  d3: 'Vitamin D3 levels—often low in indoor and office roles with limited sun exposure. In-range percentage reflects workforce sufficiency for bone and immune health.',
  diabetes: 'Fasting glucose and related markers for diabetes and pre-diabetes risk. In-range share helps gauge metabolic health across the workforce.',
  lipid: 'Cholesterol panel (e.g. LDL, HDL, triglycerides) as a cardiovascular risk indicator. Shows how many results meet clinical reference ranges.',
  inflammatory: 'Inflammatory markers such as hs-CRP indicating systemic inflammation. Higher abnormal rates may warrant lifestyle or clinical follow-up.',
};

export function bloodPanelInfo(panelId: string, panelName: string): string {
  return (
    BLOOD_PANEL_INFO[panelId] ??
    `Summary of ${panelName} blood test results for enrolled employees. Lit dots show the share within clinical reference ranges versus outside optimal range.`
  );
}
