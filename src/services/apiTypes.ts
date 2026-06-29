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

export interface ApiCampDashboardOxidativeStress {
  group: string[];
  count: number[];
  percent: number[];
  total_employees: number;
}

export interface ApiCampDashboardGenderDistribution {
  group: string[];
  count: number[];
  percent: number[];
  elevated_percent?: number;
}

export interface ApiCampDashboardGenderDistributionPair {
  male: ApiCampDashboardGenderDistribution;
  female: ApiCampDashboardGenderDistribution;
}

export interface ApiCampDashboardDiseaseGenderItem extends ApiCampDashboardGenderDistributionPair {
  code: string;
}

/** GET …/dashboard?section=distribution_by_gender_by_metabolic_syndrome */
export interface ApiCampDashboardDiseaseGenderSection {
  diseases: ApiCampDashboardDiseaseGenderItem[];
}

export type CampDashboardSection =
  | 'kpis'
  | 'participation_by_age'
  | 'overall_risk_score'
  | 'distribution_by_physical_activity_frequency'
  | 'distribution_by_sleeping_hours'
  | 'distribution_by_oxidative_stress'
  | 'distribution_by_gender_by_metabolic_syndrome'
  | 'positive_wins';

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

/** GET /assessments/me */
export interface ApiAssessment {
  assessment_instance_id: number;
  package_id: number;
  package_code?: string | null;
  package_display_name?: string | null;
  engagement_id: number;
  status: string;
  metsights_record_id?: string | null;
  assigned_at?: string | null;
  completed_at?: string | null;
}

/** GET /organizations/we */
export interface ApiOrganizationDepartment {
  department: string;
  slug: string;
}

export interface ApiMyOrganization {
  organization_id: number;
  name: string;
  organization_type?: string | null;
  logo?: string | null;
  website_url?: string | null;
  address?: string | null;
  pin_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  contact_person_user_id?: number | null;
  bd_employee_id?: number | null;
  departments?: ApiOrganizationDepartment[] | null;
  status?: string | null;
  created_at?: string | null;
  created_employee_id?: number | null;
  updated_at?: string | null;
  updated_employee_id?: number | null;
}

/** GET /organizations/{organization_id}/camps */
export interface ApiOrganizationCamp {
  camp_no: number;
  camp_name: string;
  organization_id: number;
  organization_name: string;
  start_date: string;
  engagement_count: number;
  department_count: number;
  report_count: number;
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
