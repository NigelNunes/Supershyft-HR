import { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PHYSICAL_ACTIVITY_BUCKETS, SLEEP_BUCKETS } from '../../data/participantPool';
import { CHART_INFO } from '../../content/chartInfo';
import {
  computePoorActivityPercent,
  computePoorSleepPercent,
  getPhysicalActivityConcernInsight,
  getSleepConcernInsight,
  toChartInsight,
  type ChartInsight,
} from '../../content/chartInsights';
import type { DistributionSlice, GenderDistributionPair, LifestyleGenderView } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { GenderViewToggle } from '../ui/GenderViewToggle';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import './PhysicalSleepPieCharts.css';

interface PhysicalSleepPieChartsProps {
  physical: GenderDistributionPair;
  sleep: GenderDistributionPair;
  loading?: boolean;
  maleEnrolled?: number;
  femaleEnrolled?: number;
}

const PHYSICAL_COLORS = ['#E24B4A', '#EF9F27', '#1D9E75', '#7F77DD'];
const SLEEP_COLORS = ['#E24B4A', '#EF9F27', '#5DCAA5', '#378ADD'];

function colorForLabel(label: string, labels: readonly string[], colors: string[]): string {
  const i = labels.indexOf(label);
  return colors[i >= 0 ? i : 0] ?? colors[0];
}

function SharedLegend({
  labels,
  colors,
}: {
  labels: readonly string[];
  colors: string[];
}) {
  return (
    <ul className="physical-sleep-shared-legend" aria-label="Chart legend">
      {labels.map((label) => (
        <li key={label}>
          <span
            className="physical-sleep-shared-legend__dot"
            style={{ backgroundColor: colorForLabel(label, labels, colors) }}
          />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function totalCount(slices: DistributionSlice[]): number | null {
  if (slices.length === 0) return null;
  return slices.reduce((sum, slice) => sum + (slice.count ?? 0), 0);
}

function SinglePie({
  data,
  colors,
  labelOrder,
  gender,
  showLegend,
  loading = false,
}: {
  data: DistributionSlice[];
  colors: string[];
  labelOrder: readonly string[];
  gender: 'male' | 'female';
  showLegend: boolean;
  loading?: boolean;
}) {
  const chart = useChartTheme();
  const chartData = labelOrder.map((label) => {
    const slice = data.find((d) => d.label === label);
    return {
      name: label,
      value: slice?.percent ?? 0,
      count: slice?.count ?? 0,
    };
  });
  const genderLabel = gender === 'male' ? 'Male' : 'Female';
  const total = totalCount(data);
  const hasData = total != null && data.length > 0;

  return (
    <div className="physical-sleep-pie-unit">
      <span className={`physical-sleep-pie-unit__label physical-sleep-pie-unit__label--${gender}`}>
        {genderLabel}
      </span>
      <div className="physical-sleep-pie-unit__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={78}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={colorForLabel(entry.name, labelOrder, colors)} />
              ))}
            </Pie>
            <Tooltip
              {...chart.tooltipProps}
              formatter={(value, _name, item) => {
                const count = (item?.payload as { count?: number })?.count ?? 0;
                const v = typeof value === 'number' ? value : Number(value);
                return [`${v}% (${count.toLocaleString()})`, 'Share'];
              }}
            />
            {showLegend && <Legend wrapperStyle={chart.legendStyle} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="physical-sleep-pie-unit__center" aria-hidden>
          <span className="physical-sleep-pie-unit__center-value">
            {loading ? '…' : hasData ? total.toLocaleString() : '—'}
          </span>
          <span className="physical-sleep-pie-unit__center-label">Total</span>
        </div>
      </div>
    </div>
  );
}

function LifestylePieCard({
  title,
  subtitle,
  info,
  data,
  colors,
  labelOrder,
  view,
  insight,
  loading = false,
}: {
  title: string;
  subtitle: string;
  info: string;
  data: GenderDistributionPair;
  colors: string[];
  labelOrder: readonly string[];
  view: LifestyleGenderView;
  insight?: ChartInsight;
  loading?: boolean;
}) {
  const showMale = view === 'both' || view === 'male';
  const showFemale = view === 'both' || view === 'female';
  const isBoth = view === 'both';
  const gridClass =
    isBoth ? 'physical-sleep-dual-pies' : 'physical-sleep-dual-pies physical-sleep-dual-pies--single';

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      info={info}
      insight={insight ? <InsightFooter tone={insight.tone} text={insight.text} /> : undefined}
    >
      <div className={isBoth ? 'physical-sleep-card-body' : undefined}>
        <div className={gridClass}>
          {showMale && (
            <SinglePie
              data={data.male}
              colors={colors}
              labelOrder={labelOrder}
              gender="male"
              showLegend={!isBoth}
              loading={loading}
            />
          )}
          {showFemale && (
            <SinglePie
              data={data.female}
              colors={colors}
              labelOrder={labelOrder}
              gender="female"
              showLegend={!isBoth}
              loading={loading}
            />
          )}
        </div>
        {isBoth && <SharedLegend labels={labelOrder} colors={colors} />}
      </div>
    </ChartCard>
  );
}

export function PhysicalSleepPieCharts({
  physical,
  sleep,
  loading = false,
  maleEnrolled,
  femaleEnrolled,
}: PhysicalSleepPieChartsProps) {
  const [view, setView] = useState<LifestyleGenderView>('both');
  const genderWeights =
    maleEnrolled != null && femaleEnrolled != null
      ? { male: maleEnrolled, female: femaleEnrolled }
      : undefined;
  const hasPhysicalData = physical.male.length > 0 || physical.female.length > 0;
  const hasSleepData = sleep.male.length > 0 || sleep.female.length > 0;
  const physicalInsight = hasPhysicalData
    ? toChartInsight(
        getPhysicalActivityConcernInsight(
          computePoorActivityPercent(physical, view, genderWeights),
        ),
      )
    : undefined;
  const sleepInsight = hasSleepData
    ? toChartInsight(
        getSleepConcernInsight(computePoorSleepPercent(sleep, view, genderWeights)),
      )
    : undefined;

  return (
    <div className={`physical-sleep-section${loading ? ' physical-sleep-section--loading' : ''}`}>
      <div className="physical-sleep-section__toolbar">
        <GenderViewToggle value={view} onChange={setView} />
      </div>
      <div className="grid-2">
        <LifestylePieCard
          title="Physical activity"
          subtitle={
            view === 'both'
              ? 'Distribution by activity level · male & female'
              : `Distribution by activity level · ${view}`
          }
          info={CHART_INFO.physicalActivityPie}
          data={physical}
          colors={PHYSICAL_COLORS}
          labelOrder={PHYSICAL_ACTIVITY_BUCKETS}
          view={view}
          insight={physicalInsight}
          loading={loading}
        />
        <LifestylePieCard
          title="Sleep"
        subtitle={
          view === 'both'
            ? 'Sleep hours per night · male & female'
            : `Sleep hours per night · ${view}`
        }
          info={CHART_INFO.sleepQualityPie}
          data={sleep}
          colors={SLEEP_COLORS}
          labelOrder={SLEEP_BUCKETS}
          view={view}
          insight={sleepInsight}
          loading={loading}
        />
      </div>
    </div>
  );
}
