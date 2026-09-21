import type { LifestyleGenderView } from '../types';

export type InsightTone = 'concern' | 'positive' | 'neutral';

/** Normalized insight used by chart footers. */
export interface ChartInsight {
  tone: InsightTone;
  text: string;
}

/** Gender-scoped insights from lifestyle distribution sections. */
export interface GenderChartIntelligence {
  both?: ChartInsight;
  male?: ChartInsight;
  female?: ChartInsight;
}

const TONE_LABELS: Record<InsightTone, string> = {
  concern: 'Concern',
  positive: 'Positive',
  neutral: 'Insight',
};

export function insightToneLabel(tone: InsightTone): string {
  return TONE_LABELS[tone];
}

function normalizeTone(value: unknown): InsightTone {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'positive') return 'positive';
  if (raw === 'neutral' || raw === 'insight') return 'neutral';
  return 'concern';
}

/** Map API `{ tone, statement }` → ChartInsight. */
export function mapInsightItem(raw: unknown): ChartInsight | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const record = raw as Record<string, unknown>;
  const statement = record.statement ?? record.text;
  if (typeof statement !== 'string' || !statement.trim()) return undefined;
  return {
    tone: normalizeTone(record.tone),
    text: statement.trim(),
  };
}

/** Flat section intelligence: `{ tone, statement }`. */
export function mapSimpleIntelligence(raw: unknown): ChartInsight | undefined {
  return mapInsightItem(raw);
}

/**
 * Gender map: `{ both, male, female }` each `{ tone, statement }`.
 * Also accepts a flat `{ tone, statement }` as `both`.
 */
export function mapGenderIntelligence(raw: unknown): GenderChartIntelligence | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const record = raw as Record<string, unknown>;

  if ('both' in record || 'male' in record || 'female' in record) {
    const both = mapInsightItem(record.both);
    const male = mapInsightItem(record.male);
    const female = mapInsightItem(record.female);
    if (!both && !male && !female) return undefined;
    return { both, male, female };
  }

  const flat = mapInsightItem(raw);
  return flat ? { both: flat } : undefined;
}

export function pickGenderInsight(
  intelligence: GenderChartIntelligence | undefined,
  view: LifestyleGenderView,
): ChartInsight | undefined {
  if (!intelligence) return undefined;
  if (view === 'male') return intelligence.male ?? intelligence.both;
  if (view === 'female') return intelligence.female ?? intelligence.both;
  return intelligence.both ?? intelligence.male ?? intelligence.female;
}

/** Map of disease code → insight (disease deep dive). */
export function mapDiseaseDeepDiveIntelligence(
  raw: unknown,
): Record<string, ChartInsight> | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const record = raw as Record<string, unknown>;
  const result: Record<string, ChartInsight> = {};
  for (const [code, value] of Object.entries(record)) {
    const insight = mapInsightItem(value);
    if (insight) result[code] = insight;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
