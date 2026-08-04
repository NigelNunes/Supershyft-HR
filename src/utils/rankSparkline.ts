/**
 * Map rank → highlighted bar index for rank sparklines.
 * #1 = rightmost (last bar); worse ranks move left toward the first bar.
 */
export function highlightIndexForRank(rank: number, among: number, barCount: number): number {
  if (barCount <= 1) return 0;
  const safeRank = Math.max(1, rank);
  const safeAmong = Math.max(2, among);
  const clamped = Math.min(safeRank, safeAmong);
  // Invert: best rank sits on the tall right-hand bars
  return Math.round(((safeAmong - clamped) / (safeAmong - 1)) * (barCount - 1));
}

/** Evenly ascending bar heights left → right (worst → best). */
export function uniformAscendingHeights(count: number, minHeight: number, maxHeight: number): number[] {
  if (count <= 1) return [maxHeight];
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return Math.round((minHeight + (maxHeight - minHeight) * t) * 100) / 100;
  });
}
