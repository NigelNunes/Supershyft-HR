export const OXIDATIVE_BAND_COLORS = {
  low: '#00DA5E',
  moderate: '#F59E0B',
  high: '#FF6E00',
  veryHigh: '#DE4A4A',
} as const;

export const OXIDATIVE_BAND_LABELS = [
  { key: 'low' as const, label: 'Low' },
  { key: 'moderate' as const, label: 'Moderate' },
  { key: 'high' as const, label: 'High' },
  { key: 'veryHigh' as const, label: 'Very High' },
] as const;

export function oxidativeElevatedPercent(row: {
  high: number;
  veryHigh: number;
}): number {
  return Math.round((row.high + row.veryHigh) * 10) / 10;
}
