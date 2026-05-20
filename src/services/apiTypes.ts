/**
 * Types aligned with dev-api `modules/reports/schemas.py` and report JSON payloads.
 * HR dashboard aggregates these per-participant shapes (overview + health-span-index).
 */

export interface ApiDiseaseOverview {
  code: string;
  name: string;
  risk_status: string;
  risk_score_scaled: number;
}

export interface ApiRiskAnalysisItem extends ApiDiseaseOverview {
  healthy_percentile: number;
}

export interface ApiHealthyHabitItem {
  habit_key?: string | null;
  habit_label: string;
}

export interface ApiPositiveWins {
  low_risk: ApiDiseaseOverview[];
  healthy_habits: ApiHealthyHabitItem[];
  healthy_profiles: string[];
}

export interface ApiOverviewReport {
  assessment_id: number;
  metabolic_age: number | null;
  positive_wins: ApiPositiveWins;
  risk_analysis: ApiRiskAnalysisItem[];
}

export interface ApiHealthSpanLifestyle {
  physical_activity?: string | null;
  sleep?: string | null;
  smoke?: string | null;
  alcohol?: string | null;
}

/** POST /reports/{id}/health-span-index response (scores always; details optional). */
export interface ApiHealthSpanIndex {
  lifestyle_score: number | null;
  nutrition_score: number | null;
  fitness_score: number | null;
  lifestyle?: ApiHealthSpanLifestyle | null;
}

export interface ApiRiskAnalysisList {
  assessment_id: number;
  metabolic_score: number | null;
  diseases: Array<{ code: string; name: string; risk_score_scaled: number }>;
}

export type ApiRiskStatus =
  | 'Healthy'
  | 'Moderate'
  | 'Increased'
  | 'High'
  | 'Very High'
  | string;
