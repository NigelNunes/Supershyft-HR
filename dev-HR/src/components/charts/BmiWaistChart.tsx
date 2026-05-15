import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { BmiWaistSummary } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import './BmiWaistChart.css';

const BMI_COLORS = ['#5DCAA5', '#378ADD', '#EF9F27', '#E24B4A'];

interface BmiWaistChartProps {
  data: BmiWaistSummary;
}

export function BmiWaistChart({ data }: BmiWaistChartProps) {
  const chart = useChartTheme();
  return (
    <ChartCard
      title="BMI & waist / abdominal risk"
      subtitle="Body composition across workforce"
      info={CHART_INFO.bmiWaist}
      insight={
        <InsightFooter
          tone="concern"
          text={`Avg. waist ${data.avgWaistInches} in — ${data.aboveIdealWaistPercent}% above ideal. ${data.insightTag}.`}
        />
      }
    >
      <div className="bmi-waist-layout">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.bmiDistribution}
              dataKey="percent"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
            >
              {data.bmiDistribution.map((_, i) => (
                <Cell key={i} fill={BMI_COLORS[i % BMI_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...chart.tooltipProps} formatter={(v: unknown) => [`${v}%`, 'Share']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="bmi-waist-stats">
          {data.bmiDistribution.map((b, i) => (
            <div key={b.label} className="bmi-waist-stat">
              <span className="bmi-waist-dot" style={{ background: BMI_COLORS[i] }} />
              <span>{b.label}</span>
              <strong>{b.percent}%</strong>
            </div>
          ))}
          <div className="bmi-waist-highlight">
            <span className="bmi-waist-highlight__label">Above-ideal waist</span>
            <span className="bmi-waist-highlight__val">{data.aboveIdealWaistPercent}%</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
