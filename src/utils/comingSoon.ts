import { EMPLOYEES_CAMP_YEAR } from '../config/camp';
import type {
  BloodParameterPanel,
  CompanyAverageScores,
  DiseaseRiskData,
  GenderDistributionPair,
  KpiSummary,
  OverallRiskScoreBucket,
  OxidativeStressByDept,
  ParticipationByAge,
  PositiveWins,
  RankingSummary,
  TopHighRiskDisease,
} from '../types';

/** 2026 is the live camp year — empty sections show Coming soon until data arrives. */
export function shouldShowComingSoon(
  selectedYear: string | undefined,
  loading: boolean,
  hasData: boolean,
): boolean {
  return selectedYear === EMPLOYEES_CAMP_YEAR && !loading && !hasData;
}

function hasPositiveNumber(...values: Array<number | null | undefined>): boolean {
  return values.some((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
}

export function hasKpiSectionData(kpis: KpiSummary | null | undefined): boolean {
  return kpis != null;
}

export function hasRankingSectionData(ranking: RankingSummary | null | undefined): boolean {
  return ranking != null && hasPositiveNumber(ranking.cityRank, ranking.industryRank);
}

export function hasParticipationSectionData(
  rows: ParticipationByAge[] | null | undefined,
): boolean {
  return Boolean(rows?.some((row) => row.enrolled > 0 || row.percent > 0));
}

export function hasOverallRiskSectionData(
  buckets: OverallRiskScoreBucket[] | null | undefined,
): boolean {
  return Boolean(buckets?.some((bucket) => bucket.count > 0 || bucket.percent > 0));
}

export function hasMetabolicSectionData(
  categories: { count: number }[] | null | undefined,
): boolean {
  return Boolean(categories?.some((category) => category.count > 0));
}

export function hasCompanyScoresData(scores: CompanyAverageScores | null | undefined): boolean {
  if (!scores) return false;
  return hasPositiveNumber(scores.nutrition, scores.fitness, scores.lifestyle);
}

export function hasGenderDistributionData(
  pair: GenderDistributionPair | null | undefined,
): boolean {
  if (!pair) return false;
  return [...pair.male, ...pair.female].some(
    (slice) => (slice.count ?? 0) > 0 || slice.percent > 0,
  );
}

export function hasTopDiseaseData(diseases: TopHighRiskDisease[] | null | undefined): boolean {
  return Boolean(diseases?.some((disease) => disease.highRiskPercent > 0));
}

export function hasDiseaseDeepDiveData(diseases: DiseaseRiskData[] | null | undefined): boolean {
  return Boolean(
    diseases?.some((disease) =>
      disease.buckets.some((bucket) =>
        Object.values(bucket.segments).some((value) => value > 0),
      ),
    ),
  );
}

export function hasOxidativeSectionData(
  rows: OxidativeStressByDept[] | null | undefined,
): boolean {
  return Boolean(
    rows?.some((row) => hasPositiveNumber(row.low, row.moderate, row.high, row.veryHigh)),
  );
}

export function hasBloodPanelData(panels: BloodParameterPanel[] | null | undefined): boolean {
  return Boolean(panels && panels.length > 0);
}

export function hasPositiveWinsData(data: PositiveWins | null | undefined): boolean {
  if (!data) return false;
  return (
    data.lowRisk.length > 0 ||
    data.healthyHabits.length > 0 ||
    data.healthyProfiles.length > 0
  );
}
