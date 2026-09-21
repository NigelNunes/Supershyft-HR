import type { ChartInsight, InsightTone } from './chartIntelligence';
import { mapInsightItem } from './chartIntelligence';

export type LeadershipTakeawayId =
  | 'workforce-health'
  | 'lifestyle-priority'
  | 'disease-focus'
  | 'strategic-next-step';

export interface LeadershipTakeaway {
  id: LeadershipTakeawayId;
  title: string;
  tone: InsightTone;
  text: string;
}

const TAKEAWAY_SPECS: {
  id: LeadershipTakeawayId;
  apiKey: string;
  title: string;
}[] = [
  { id: 'workforce-health', apiKey: 'workforce_health', title: 'Workforce Health' },
  { id: 'lifestyle-priority', apiKey: 'lifestyle_priority', title: 'Lifestyle Priority' },
  { id: 'disease-focus', apiKey: 'disease_focus', title: 'Disease Focus' },
  {
    id: 'strategic-next-step',
    apiKey: 'strategic_next_step',
    title: 'Strategic Next Step',
  },
];

/**
 * Map `intelligence` from GET …/dashboard?section=leadership_takeaways.
 * Keys: workforce_health, lifestyle_priority, disease_focus, strategic_next_step.
 */
export function mapLeadershipTakeawaysIntelligence(
  intelligence: unknown,
): LeadershipTakeaway[] {
  if (intelligence == null || typeof intelligence !== 'object' || Array.isArray(intelligence)) {
    return [];
  }

  const record = intelligence as Record<string, unknown>;
  const result: LeadershipTakeaway[] = [];

  for (const spec of TAKEAWAY_SPECS) {
    const insight: ChartInsight | undefined = mapInsightItem(record[spec.apiKey]);
    if (!insight) continue;
    result.push({
      id: spec.id,
      title: spec.title,
      tone: insight.tone,
      text: insight.text,
    });
  }

  return result;
}

export function hasLeadershipTakeawaysData(
  takeaways: LeadershipTakeaway[] | null | undefined,
): boolean {
  return Boolean(takeaways?.some((item) => item.text.trim().length > 0));
}
