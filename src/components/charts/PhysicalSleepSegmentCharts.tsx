import { useState } from 'react';
import { Info, OctagonAlert } from 'lucide-react';
import { PHYSICAL_ACTIVITY_BUCKETS, SLEEP_BUCKETS } from '../../data/participantPool';
import { CHART_INFO } from '../../content/chartInfo';
import {
  computePoorActivityPercent,
  computePoorSleepPercent,
  getPhysicalActivityConcernInsight,
  getSleepConcernInsight,
  toChartInsight,
} from '../../content/chartInsights';
import type { DistributionSlice, GenderDistributionPair, LifestyleGenderView } from '../../types';
import type { YearOption } from '../layout/DashboardHeader';
import './PhysicalSleepSegmentCharts.css';

interface PhysicalSleepSegmentChartsProps {
  physical: GenderDistributionPair;
  sleep: GenderDistributionPair;
  loading?: boolean;
  maleEnrolled?: number;
  femaleEnrolled?: number;
  selectedYear?: YearOption;
}

/** Figma palette — physical activity */
const PHYSICAL_COLORS: Record<string, string> = {
  'Less than 30mins': '#3B82F6',
  '30-60mins': '#FED300',
  'More than 60 mins': '#FF589B',
  'Rarely or Never': '#9874F8',
};

/** Figma palette — sleep */
const SLEEP_COLORS: Record<string, string> = {
  'Less than 5': '#3B82F6',
  '5-7': '#67E394',
  '7-9': '#9874F8',
  'More than 9': '#EF9F27',
};

function sliceTotal(slices: DistributionSlice[]): number {
  return slices.reduce((sum, s) => sum + (s.count ?? 0), 0);
}

function slicePercent(slices: DistributionSlice[], label: string): number {
  return slices.find((s) => s.label === label)?.percent ?? 0;
}

function GenderToggle({
  value,
  onChange,
}: {
  value: LifestyleGenderView;
  onChange: (v: LifestyleGenderView) => void;
}) {
  const options: { id: LifestyleGenderView; label: string }[] = [
    { id: 'both', label: 'Both' },
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
  ];

  return (
    <div className="ps-gender-toggle" role="group" aria-label="Show charts for">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`ps-gender-toggle__btn${value === opt.id ? ' ps-gender-toggle__btn--active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SegmentBar({
  slices,
  labels,
  colors,
}: {
  slices: DistributionSlice[];
  labels: readonly string[];
  colors: Record<string, string>;
}) {
  const parts = labels
    .map((label) => ({
      label,
      pct: Math.max(0, slicePercent(slices, label)),
      color: colors[label] ?? '#6B7280',
    }))
    .filter((p) => p.pct > 0.05);

  const sum = parts.reduce((acc, p) => acc + p.pct, 0) || 1;

  if (parts.length === 0) {
    return <div className="ps-segment-bar ps-segment-bar--empty" aria-hidden />;
  }

  return (
    <div className="ps-segment-bar" aria-hidden>
      {parts.map((part, i) => (
        <span
          key={part.label}
          className={`ps-segment-bar__seg${i === 0 ? ' ps-segment-bar__seg--first' : ''}`}
          style={{
            flexGrow: part.pct / sum,
            flexBasis: 0,
            backgroundColor: part.color,
            zIndex: parts.length - i,
          }}
          title={`${part.label}: ${Math.round(part.pct)}%`}
        />
      ))}
    </div>
  );
}

function GenderRow({
  gender,
  total,
  slices,
  labels,
  colors,
  loading,
}: {
  gender: 'male' | 'female';
  total: number | null;
  slices: DistributionSlice[];
  labels: readonly string[];
  colors: Record<string, string>;
  loading: boolean;
}) {
  return (
    <div className="ps-gender-row">
      <div className="ps-gender-row__total">
        <span className="ps-gender-row__total-label">Total</span>
        <span className="ps-gender-row__total-value">
          {loading ? '…' : total == null ? '—' : total.toLocaleString()}
        </span>
      </div>
      <div className="ps-gender-row__chart">
        <span className="ps-gender-row__gender">{gender === 'male' ? 'MALE' : 'FEMALE'}</span>
        <SegmentBar slices={slices} labels={labels} colors={colors} />
      </div>
    </div>
  );
}

function Legend({
  labels,
  colors,
}: {
  labels: readonly string[];
  colors: Record<string, string>;
}) {
  return (
    <ul className="ps-legend" aria-label="Chart legend">
      {labels.map((label) => (
        <li key={label} className="ps-legend__item">
          <span className="ps-legend__swatch" style={{ backgroundColor: colors[label] }} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function LifestyleCard({
  title,
  subtitle,
  info,
  data,
  labels,
  colors,
  view,
  concernText,
  loading,
  maleTotal,
  femaleTotal,
}: {
  title: string;
  subtitle: string;
  info: string;
  data: GenderDistributionPair;
  labels: readonly string[];
  colors: Record<string, string>;
  view: LifestyleGenderView;
  concernText?: string;
  loading: boolean;
  maleTotal: number | null;
  femaleTotal: number | null;
}) {
  const showMale = view === 'both' || view === 'male';
  const showFemale = view === 'both' || view === 'female';

  return (
    <article className="ps-card">
      <header className="ps-card__header">
        <div className="ps-card__title-row">
          <h3 className="ps-card__title">{title}</h3>
          <span className="ps-card__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="ps-card__info-popup" role="tooltip">
              {info}
            </span>
          </span>
        </div>
        <p className="ps-card__subtitle">{subtitle}</p>
      </header>

      <div className="ps-card__body">
        <div className="ps-card__rows">
          {showMale && (
            <GenderRow
              gender="male"
              total={maleTotal}
              slices={data.male}
              labels={labels}
              colors={colors}
              loading={loading}
            />
          )}
          {showFemale && (
            <GenderRow
              gender="female"
              total={femaleTotal}
              slices={data.female}
              labels={labels}
              colors={colors}
              loading={loading}
            />
          )}
        </div>
        <Legend labels={labels} colors={colors} />
      </div>

      {concernText && (
        <footer className="ps-card__concern">
          <div className="ps-card__concern-title">
            <OctagonAlert size={22} strokeWidth={1.75} aria-hidden />
            <span>Concern</span>
          </div>
          <p className="ps-card__concern-text">{concernText}</p>
        </footer>
      )}
    </article>
  );
}

export function PhysicalSleepSegmentCharts({
  physical,
  sleep,
  loading = false,
  maleEnrolled,
  femaleEnrolled,
}: PhysicalSleepSegmentChartsProps) {
  const [view, setView] = useState<LifestyleGenderView>('both');
  const genderWeights =
    maleEnrolled != null && femaleEnrolled != null
      ? { male: maleEnrolled, female: femaleEnrolled }
      : undefined;

  const malePhysicalTotal =
    maleEnrolled ?? (physical.male.length ? sliceTotal(physical.male) : null);
  const femalePhysicalTotal =
    femaleEnrolled ?? (physical.female.length ? sliceTotal(physical.female) : null);
  const maleSleepTotal = maleEnrolled ?? (sleep.male.length ? sliceTotal(sleep.male) : null);
  const femaleSleepTotal =
    femaleEnrolled ?? (sleep.female.length ? sliceTotal(sleep.female) : null);

  const hasPhysical = physical.male.length > 0 || physical.female.length > 0;
  const hasSleep = sleep.male.length > 0 || sleep.female.length > 0;

  const physicalInsight = hasPhysical
    ? toChartInsight(
        getPhysicalActivityConcernInsight(
          computePoorActivityPercent(physical, view, genderWeights),
        ),
      )
    : undefined;
  const sleepInsight = hasSleep
    ? toChartInsight(
        getSleepConcernInsight(computePoorSleepPercent(sleep, view, genderWeights)),
      )
    : undefined;

  const physicalSubtitle =
    view === 'both'
      ? 'Distribution by activity level · male & female'
      : `Distribution by activity level · ${view}`;
  const sleepSubtitle =
    view === 'both'
      ? 'Sleep hours per night · male & female'
      : `Sleep hours per night · ${view}`;

  return (
    <section className={`ps-section${loading ? ' ps-section--loading' : ''}`}>
      <div className="ps-section__toolbar">
        <GenderToggle value={view} onChange={setView} />
      </div>
      <div className="ps-section__grid">
        <LifestyleCard
          title="Physical activity"
          subtitle={physicalSubtitle}
          info={CHART_INFO.physicalActivityPie}
          data={physical}
          labels={PHYSICAL_ACTIVITY_BUCKETS}
          colors={PHYSICAL_COLORS}
          view={view}
          concernText={physicalInsight?.text}
          loading={loading}
          maleTotal={malePhysicalTotal}
          femaleTotal={femalePhysicalTotal}
        />
        <LifestyleCard
          title="Sleep"
          subtitle={sleepSubtitle}
          info={CHART_INFO.sleepQualityPie}
          data={sleep}
          labels={SLEEP_BUCKETS}
          colors={SLEEP_COLORS}
          view={view}
          concernText={sleepInsight?.text}
          loading={loading}
          maleTotal={maleSleepTotal}
          femaleTotal={femaleSleepTotal}
        />
      </div>
    </section>
  );
}
