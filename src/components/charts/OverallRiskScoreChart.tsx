import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { OverallRiskScoreBucket } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { OVERALL_RISK_COLORS, useChartTheme } from './chartTheme';
import './OverallRiskScoreChart.css';

interface OverallRiskScoreChartProps {
  buckets: OverallRiskScoreBucket[];
  loading?: boolean;
}

export function OverallRiskScoreChart({ buckets, loading = false }: OverallRiskScoreChartProps) {
  const chart = useChartTheme();
  const chartData = buckets.map((b) => ({
    name: b.band,
    value: b.percent,
    count: b.count,
  }));
  const elevated = buckets
    .filter((b) => b.band === 'Increased Risk' || b.band === 'High risk')
    .reduce((sum, b) => sum + b.percent, 0);
  const elevatedDisplay = Math.round(elevated * 10) / 10;
  const totalCount = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <ChartCard
      className="overall-risk-pie-card"
      title="Overall risk score"
      subtitle="Workforce distribution by risk band"
      info={CHART_INFO.overallRiskScore}
      insight={
        buckets.length > 0 ? (
          <InsightFooter
            tone={elevated > 25 ? 'concern' : 'neutral'}
            text={`${elevatedDisplay}% of employees fall in Increased Risk or High risk bands — use for programme prioritisation and doctor consultation outreach.`}
          />
        ) : undefined
      }
    >
      <div className="overall-risk-pie">
        <div className="overall-risk-pie__chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={OVERALL_RISK_COLORS[entry.name] ?? chart.colors.accent}
                  />
                ))}
              </Pie>
              <Tooltip
                {...chart.tooltipProps}
                formatter={(value, _name, item) => {
                  const count = (item?.payload as { count?: number })?.count ?? 0;
                  const v = typeof value === 'number' ? value : Number(value);
                  return [`${v}% (${count.toLocaleString()} employees)`, 'Share'];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="overall-risk-pie__center" aria-hidden>
            <span className="overall-risk-pie__center-value">
              {loading ? '…' : buckets.length > 0 ? `${elevatedDisplay}%` : '—'}
            </span>
            <span className="overall-risk-pie__center-label">elevated</span>
          </div>
        </div>
        <ul className="overall-risk-pie__bands">
          {buckets.map((b) => (
            <li key={b.band}>
              <span
                className="overall-risk-pie__dot"
                style={{ backgroundColor: OVERALL_RISK_COLORS[b.band] }}
              />
              <span className="overall-risk-pie__band-name">{b.band}</span>
              <span className="overall-risk-pie__band-stat">
                {b.percent}% · {b.count.toLocaleString()}
              </span>
            </li>
          ))}
          <li className="overall-risk-pie__total">
            <span>
              {loading
                ? 'Loading…'
                : buckets.length > 0
                  ? `${totalCount.toLocaleString()} employees assessed`
                  : 'No data available'}
            </span>
          </li>
        </ul>
      </div>
    </ChartCard>
  );
}
