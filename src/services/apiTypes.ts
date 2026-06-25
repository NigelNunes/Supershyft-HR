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

/** GET /reports/camps/{camp_no}/dashboard?section=… */
export interface ApiCampDashboardSection<T> {
  data: T;
  name: string;
  description: string | null;
}

export interface ApiCampDashboardKpis {
  employees_enrolled: number;
  male_enrolled: number;
  female_enrolled: number;
  total_blood_test: number;
  blood_test_percent: number;
  doctor_consultation: number;
  high_risk_group: number;
}

export interface ApiCampDashboardParticipationByAge {
  age_group: string[];
  enrolled: number[];
  percent: number[];
  total_enrolled: number;
}

export interface ApiCampDashboardOverallRiskScore {
  group: string[];
  count: number[];
  percent: number[];
  total_employees: number;
  avg_metabolic_score: number;
}

export interface ApiCampDashboardGenderDistribution {
  group: string[];
  count: number[];
  percent: number[];
}

export interface ApiCampDashboardGenderDistributionPair {
  male: ApiCampDashboardGenderDistribution;
  female: ApiCampDashboardGenderDistribution;
}

export type CampDashboardSection =
  | 'kpis'
  | 'participation_by_age'
  | 'overall_risk_score'
  | 'distribution_by_physical_activity_frequency'
  | 'distribution_by_sleeping_hours';

/** GET /reports/camps/{camp_no}/participants */
export interface ApiCampParticipant {
  user_id?: number;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  participant_blood_group?: string | null;
  department?: string | null;
  participant_department?: string | null;
}

export interface ApiPaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

/** GET /users/me */
export interface ApiCurrentUser {
  user_id: number;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  phone?: string | null;
  email?: string | null;
  profile_photo?: string | null;
  gender?: string | null;
  city?: string | null;
  status?: string | null;
}
