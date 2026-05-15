import type { BloodGroupHeatmapRow } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { CHART_INFO } from '../../content/chartInfo';
import './BloodGroupHeatmap.css';

interface BloodGroupHeatmapProps {
  rows: BloodGroupHeatmapRow[];
  groupNames: string[];
}

function cellColor(pct: number): string {
  if (pct >= 80) return 'var(--heatmap-high)';
  if (pct >= 65) return 'var(--heatmap-mid)';
  if (pct >= 50) return 'var(--heatmap-low)';
  return 'var(--heatmap-critical)';
}

export function BloodGroupHeatmap({ rows, groupNames }: BloodGroupHeatmapProps) {
  const worst = rows.flatMap((r) =>
    groupNames.map((g) => ({ dept: r.department, group: g, pct: r.groups[g] ?? 0 })),
  ).sort((a, b) => a.pct - b.pct)[0];

  return (
    <ChartCard
      title="Blood parameter groups — department heatmap"
      subtitle="% of tests in reference range"
      info={CHART_INFO.bloodHeatmap}
      insight={
        <InsightFooter
          tone="concern"
          text={
            worst
              ? `Lowest in-range: ${worst.group} in ${worst.dept} (${worst.pct}%). Target screening and education there first.`
              : 'Compare departments to prioritise lab follow-ups.'
          }
        />
      }
    >
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Department</th>
              {groupNames.map((g) => (
                <th key={g}>{g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.department}>
                <td className="heatmap-table__dept">{row.department}</td>
                {groupNames.map((g) => {
                  const pct = row.groups[g] ?? 0;
                  return (
                    <td key={g}>
                      <span
                        className="heatmap-cell"
                        style={{ background: cellColor(pct) }}
                        title={`${row.department} · ${g}: ${pct}% in range`}
                      >
                        {pct}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="heatmap-legend">
        <span>Green = higher in-range rate · hover a cell for department and panel details</span>
      </p>
    </ChartCard>
  );
}
