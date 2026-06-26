import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { DiseaseRiskData } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { CHART_COLORS, useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';
import './DiseaseDeepDive.css';

interface DiseaseDeepDiveProps {
  diseases: DiseaseRiskData[];
  loading?: boolean;
}

export function DiseaseDeepDive({ diseases, loading = false }: DiseaseDeepDiveProps) {
  const chart = useChartTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = diseases[activeIndex] ?? diseases[0];

  const chartData = useMemo(() => {
    if (!active) return [];
    return active.buckets.map((bucket) => ({
      level: bucket.level,
      ...bucket.segments,
    }));
  }, [active]);

  const segmentKeys = useMemo(
    () => (active ? Object.keys(active.buckets[0]?.segments ?? {}) : []),
    [active],
  );

  const insight = useMemo(() => {
    if (!active || loading) return '';
    const healthy = active.buckets.find((bucket) => bucket.level === 'Healthy');
    const total = healthy
      ? Object.values(healthy.segments).reduce((sum, value) => sum + value, 0) /
        Math.max(segmentKeys.length, 1)
      : 0;
    const high = active.buckets
      .filter((bucket) => bucket.level === 'High' || bucket.level === 'Very High')
      .flatMap((bucket) => Object.values(bucket.segments));
    const highAvg = high.length ? high.reduce((sum, value) => sum + value, 0) / high.length : 0;
    return `For ${active.disease.name}, ~${Math.round(total)}% of the workforce (gender) is in the Healthy band, while elevated risk (High + Very High) averages ${Math.round(highAvg)}% across segments.`;
  }, [active, loading, segmentKeys.length]);

  return (
    <ChartCard
      className="disease-deep-dive"
      title="Disease deep dive analysis"
      subtitle={`Risk distribution by gender · ${active?.disease.name ?? ''}`}
      info={CHART_INFO.diseaseDeepDive}
      insight={insight ? <InsightFooter tone="neutral" text={insight} /> : undefined}
      actions={
        active && !loading ? (
          <span
            className={`status-pill status-pill--${active.overallStatus.toLowerCase().replace(' ', '-')}`}
          >
            {active.overallStatus}
          </span>
        ) : undefined
      }
    >
      <div className="disease-tabs">
        {diseases.map((disease, index) => (
          <button
            key={disease.disease.code}
            type="button"
            className={`disease-tab${index === activeIndex ? ' disease-tab--active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {disease.disease.name}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis dataKey="level" tick={chart.tick(12)} />
          <YAxis
            tick={chart.tick(12)}
            label={{
              value: 'Percentage (%)',
              angle: -90,
              position: 'insideLeft',
              ...chart.axisLabel(11),
            }}
            domain={[0, 100]}
          />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={{ ...chart.legendStyle, paddingTop: 12 }} />
          {segmentKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {loading && <p className="disease-deep-dive__empty">Loading disease distribution…</p>}
      {!loading && diseases.length === 0 && (
        <p className="disease-deep-dive__empty">No disease distribution data available.</p>
      )}
    </ChartCard>
  );
}
