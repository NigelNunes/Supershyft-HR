export type RiskLevel = 'Healthy' | 'Increased' | 'High' | 'Very High';

export type ToggleDimension = 'gender' | 'department';

export type DiseaseCode =
  | 'metabolic_syndrome'
  | 'type_2_diabetes'
  | 'hypertension'
  | 'obesity'
  | 'pcos_pcod'
  | 'nafld'
  | 'cardiac_health'
  | 'thyroid_health'
  | 'dyslipidemia'
  | 'oxidative_stress';

export interface DiseaseDefinition {
  code: DiseaseCode;
  name: string;
}

export interface KpiSummary {
  employeesEnrolled: number;
  maleEnrolled?: number;
  femaleEnrolled?: number;
  totalBloodTest: number;
  bloodTestPercent?: number;
  totalBioAiReports?: number;
  bioAiPercent?: number;
  questionnaireCompleted?: number;
  doctorConsultation: number;
  nutritionistConsultation: number;
  doctorAndNutritionistConsultation?: number;
  highRiskGroup: number;
  cautionRiskGroup?: number;
  goodRiskGroup?: number;
}

export interface RankingSummary {
  city: string;
  cityRank: number;
  industryRank: number;
}

export interface ParticipationByAge {
  ageGroup: string;
  enrolled: number;
  percent: number;
}

export interface ParticipationByGender {
  gender: string;
  enrolled: number;
  percent: number;
}

export interface TopHighRiskDisease {
  name: string;
  highRiskPercent: number;
}

export interface CompanyAverageScores {
  nutrition: number;
  fitness: number;
  lifestyle: number;
}

export type OverallRiskBand = 'Optimal' | 'Low risk' | 'Increased Risk' | 'High risk';

export interface OverallRiskScoreBucket {
  band: OverallRiskBand;
  percent: number;
  count: number;
}

export interface DistributionSlice {
  label: string;
  percent: number;
  count?: number;
}

export interface GenderDistributionPair {
  male: DistributionSlice[];
  female: DistributionSlice[];
  /** From API `total_responded` (or sum of counts) — prefer over KPI enrolled. */
  maleTotalResponded?: number;
  femaleTotalResponded?: number;
}

export type LifestyleGenderView = 'both' | 'male' | 'female';

export interface RiskDistributionBucket {
  level: RiskLevel;
  segments: Record<string, number>;
}

export interface DiseaseRiskData {
  disease: DiseaseDefinition;
  buckets: RiskDistributionBucket[];
  overallStatus: RiskLevel;
}

export interface LifestyleBucket {
  label: string;
  segments: Record<string, number>;
}

export interface LifestyleIndicator {
  id: string;
  title: string;
  buckets: LifestyleBucket[];
  insight: { tone: 'concern' | 'positive' | 'neutral'; text: string };
}

export interface OxidativeStressByDept {
  department: string;
  low: number;
  moderate: number;
  high: number;
  veryHigh: number;
}

export interface BloodParameterPanel {
  id: string;
  name: string;
  abnormalPercent: number;
  inRangePercent: number;
}

export interface GenderComparisonMetric {
  metric: string;
  male: number;
  female: number;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export type JourneyStepStatus = 'completed' | 'in_progress' | 'pending';

export type JourneyStepId =
  | 'anthropometry'
  | 'vitals'
  | 'dietLifestyle'
  | 'bloodReport'
  | 'bloodReportAi'
  | 'bioAiReport'
  | 'bioAiShared'
  | 'consultations';

export interface EmployeeRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: string;
  department: string;
  /** Department slug from API (participant_department), used for filters. */
  departmentSlug?: string;
  /** Organization employee ID from the participants API, when present. */
  employeeId?: string;
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  journey: Record<JourneyStepId, JourneyStepStatus>;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  headcount: number;
  enrolledPercent: number;
  highRiskPercent: number;
}

export interface DepartmentLifestyleDistribution {
  physical: DistributionSlice[];
  sleep: DistributionSlice[];
}

export interface DepartmentGenderBreakdown {
  male: number;
  female: number;
}

export interface DepartmentDetail extends DepartmentSummary {
  avgRiskScore: number;
  topHighRiskDiseases: TopHighRiskDisease[];
  diseases: DiseaseRiskData[];
  genderBreakdown: DepartmentGenderBreakdown;
  lifestyleDistribution: DepartmentLifestyleDistribution;
  physicalActivityByGender: GenderDistributionPair;
  sleepQualityByGender: GenderDistributionPair;
  oxidativeStress: OxidativeStressByDept;
  companyScores: CompanyAverageScores;
  kpis: KpiSummary;
  participationByAge: ParticipationByAge[];
  overallRiskScore: OverallRiskScoreBucket[];
  /** Mapped for MetabolicAgeDistributionCard (GOOD / NEEDS ATTENTION / HIGH RISK). */
  metabolicAgeCategories: {
    key: 'good' | 'attention' | 'highRisk';
    label: string;
    count: number;
    percent: number;
  }[];
}

export interface CampHistoryEntry {
  id: string;
  year: number;
  label: string;
  participants: number;
  highRiskPercent: number;
  enrolledPercent: number;
}

export interface HrProfile {
  name: string;
  phone: string;
  companyName: string;
  companyLogo?: string;
}

export interface OrganizationContext {
  organizationId: number;
  hasHistory: boolean;
  campYear: number;
}

export interface MetabolicAgeBucket {
  label: string;
  count: number;
  percent: number;
  isHighRisk: boolean;
}

export interface MetabolicAgeSummary {
  buckets: MetabolicAgeBucket[];
  avgGapYears: number;
  highRiskPercent: number;
}

export interface PositiveWinDisease {
  code: string;
  name: string;
  riskStatus: string;
}

export interface PositiveWins {
  lowRisk: PositiveWinDisease[];
  healthyHabits: { habitLabel: string }[];
  healthyProfiles: string[];
}

export interface NutritionMacroStat {
  name: string;
  withinIdealPercent: number;
  aboveIdealPercent: number;
  belowIdealPercent: number;
}

export interface NutritionSummary {
  avgScore: number;
  riskBand: string;
  macros: NutritionMacroStat[];
}

export interface BmiBucket {
  label: string;
  percent: number;
}

export interface BmiWaistSummary {
  bmiDistribution: BmiBucket[];
  avgWaistInches: number;
  aboveIdealWaistPercent: number;
  insightTag: string;
}

export interface BloodGroupHeatmapRow {
  department: string;
  groups: Record<string, number>;
}

export interface AbnormalMarker {
  testName: string;
  abnormalPercent: number;
}

export type InsightCardVariant =
  | 'blue'
  | 'red'
  | 'orange'
  | 'green'
  | 'purple'
  | 'pink'
  | 'yellow';

export interface DataInsightCard {
  id: string;
  title: string;
  variant: InsightCardVariant;
  bullets: string[];
}

export type RecommendationTierVariant = 'immediate' | 'short' | 'long';

export interface RecommendationTier {
  id: string;
  title: string;
  timeframe: string;
  variant: RecommendationTierVariant;
  items: string[];
}

export interface KeyInsightsData {
  insightCards: DataInsightCard[];
  recommendationTiers: RecommendationTier[];
}

export interface DashboardData {
  kpis: KpiSummary;
  participationByAge: ParticipationByAge[];
  participationByGender: ParticipationByGender[];
  topHighRiskDiseases: TopHighRiskDisease[];
  companyScores: CompanyAverageScores;
  overallRiskScore: OverallRiskScoreBucket[];
  physicalActivityByGender: GenderDistributionPair;
  sleepQualityByGender: GenderDistributionPair;
  diseases: DiseaseRiskData[];
  lifestyle: LifestyleIndicator[];
  oxidativeStress: OxidativeStressByDept[];
  bloodPanels: BloodParameterPanel[];
  genderComparison: GenderComparisonMetric[];
  interventions: Intervention[];
  metabolicAge: MetabolicAgeSummary;
  positiveWins: PositiveWins;
  nutrition: NutritionSummary;
  bmiWaist: BmiWaistSummary;
  bloodGroupHeatmap: BloodGroupHeatmapRow[];
  bloodGroupNames: string[];
  abnormalMarkers: AbnormalMarker[];
  keyInsights: KeyInsightsData;
  departments: DepartmentSummary[];
  employees: EmployeeRecord[];
  history: CampHistoryEntry[];
  org: OrganizationContext;
  hr: HrProfile;
}
