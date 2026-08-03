import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, Info } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { getOverallRiskConcernInsight } from '../../content/chartInsights';
import {
  DUMMY_ALL_YEARS_OVERALL_RISK,
  DUMMY_ALL_YEARS_OVERALL_RISK_CONCERN,
} from '../../data/dummyAllYearsMetrics';
import type { YearOption } from '../layout/DashboardHeader';
import type { OverallRiskBand, OverallRiskScoreBucket } from '../../types';
import { OVERALL_RISK_COLORS, useChartTheme } from './chartTheme';
import { PieHoverTooltip } from './PieHoverTooltip';
import './OverallRiskScoreChart.css';

interface OverallRiskScoreChartProps {
  buckets: OverallRiskScoreBucket[];
  loading?: boolean;
  selectedYear?: YearOption;
}

const BAND_ORDER: OverallRiskBand[] = ['Optimal', 'Low risk', 'Increased Risk', 'High risk'];

function normalizeBuckets(buckets: OverallRiskScoreBucket[]): OverallRiskScoreBucket[] {
  const byBand = new Map(buckets.map((b) => [b.band, b]));
  return BAND_ORDER.map(
    (band) => byBand.get(band) ?? { band, percent: 0, count: 0 },
  );
}

function RiskPie({
  data,
  assessed,
  size = 'lg',
}: {
  data: { name: string; value: number; count: number }[];
  assessed: string;
  size?: 'lg' | 'sm';
}) {
  const chart = useChartTheme();
  const dim = size === 'sm' ? 128 : 208;
  const inner = size === 'sm' ? 46 : 62;
  const outer = size === 'sm' ? 58 : 92;
  const chartData =
    data.length > 0 ? data : [{ name: 'empty', value: 1, count: 0 }];

  const pie = (
    <PieChart width={dim} height={dim} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={inner}
        outerRadius={outer}
        paddingAngle={data.length > 1 ? 3.5 : 0}
        cornerRadius={size === 'sm' ? 5 : 7}
        stroke="none"
      >
        {chartData.map((entry) => (
          <Cell
            key={entry.name}
            fill={
              entry.name === 'empty'
                ? 'rgba(255,255,255,0.08)'
                : (OVERALL_RISK_COLORS[entry.name] ?? chart.colors.accent)
            }
            style={
              entry.name === 'Low risk'
                ? {
                    filter: 'drop-shadow(0px -3px 10px rgba(153, 162, 249, 0.28))',
                  }
                : undefined
            }
          />
        ))}
      </Pie>
      {data.length > 0 && (
        <Tooltip content={<PieHoverTooltip />} wrapperStyle={{ zIndex: 20, outline: 'none' }} />
      )}
    </PieChart>
  );

  return (
    <div
      className={`overall-risk-pie__chart overall-risk-pie__chart--${size}`}
      style={size === 'sm' ? { width: dim, height: dim } : undefined}
    >
      {size === 'lg' ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={outer}
              paddingAngle={data.length > 1 ? 3.5 : 0}
              cornerRadius={7}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === 'empty'
                      ? 'rgba(255,255,255,0.08)'
                      : (OVERALL_RISK_COLORS[entry.name] ?? chart.colors.accent)
                  }
                  style={
                    entry.name === 'Low risk'
                      ? {
                          filter: 'drop-shadow(0px -3px 10px rgba(153, 162, 249, 0.28))',
                        }
                      : undefined
                  }
                />
              ))}
            </Pie>
            {data.length > 0 && (
              <Tooltip content={<PieHoverTooltip />} wrapperStyle={{ zIndex: 20, outline: 'none' }} />
            )}
          </PieChart>
        </ResponsiveContainer>
      ) : (
        pie
      )}
      <div className="overall-risk-pie__center" aria-hidden>
        <span className="overall-risk-pie__center-value">{assessed}</span>
        <span className="overall-risk-pie__center-label">Assessed</span>
      </div>
    </div>
  );
}

function AllYearsOverallRisk() {
  // TEMPORARY: DUMMY_ALL_YEARS_OVERALL_RISK_* — remove when multi-year API exists
  return (
    <>
      <div className="overall-risk-card__allyears">
        <div className="overall-risk-card__allyears-pies">
          {DUMMY_ALL_YEARS_OVERALL_RISK.map((yearBlock) => {
            const chartData = yearBlock.bands
              .filter((b) => b.percent > 0 || b.count > 0)
              .map((b) => ({
                name: b.band,
                value: b.percent,
                count: b.count,
              }));
            return (
              <div key={yearBlock.year} className="overall-risk-card__allyears-col">
                <span className="overall-risk-card__allyears-year">{yearBlock.year}</span>
                <RiskPie
                  data={chartData}
                  assessed={yearBlock.assessed.toLocaleString()}
                  size="sm"
                />
              </div>
            );
          })}
        </div>

        <ul className="overall-risk-pie__legend overall-risk-pie__legend--horizontal">
          {BAND_ORDER.map((band) => (
            <li key={band} className="overall-risk-pie__legend-item">
              <span
                className="overall-risk-pie__dot"
                style={{ backgroundColor: OVERALL_RISK_COLORS[band] }}
              />
              <span className="overall-risk-pie__label">{band}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="overall-risk-card__concern">
        <div className="overall-risk-card__concern-title">
          <AlertCircle size={20} aria-hidden />
          <span>Concern</span>
        </div>
        <p className="overall-risk-card__concern-text">{DUMMY_ALL_YEARS_OVERALL_RISK_CONCERN}</p>
      </div>
    </>
  );
}

function SingleYearOverallRisk({
  buckets,
  loading,
}: {
  buckets: OverallRiskScoreBucket[];
  loading: boolean;
}) {
  const normalized = normalizeBuckets(buckets);
  const chartData = normalized
    .filter((b) => b.percent > 0 || b.count > 0)
    .map((b) => ({
      name: b.band,
      value: b.percent,
      count: b.count,
    }));
  const elevated = normalized
    .filter((b) => b.band === 'Increased Risk' || b.band === 'High risk')
    .reduce((sum, b) => sum + b.percent, 0);
  const totalCount = normalized.reduce((sum, b) => sum + b.count, 0);
  const concernInsight =
    buckets.length > 0 ? getOverallRiskConcernInsight(elevated) : undefined;

  return (
    <>
      <div className="overall-risk-card__body">
        <RiskPie
          data={chartData}
          assessed={loading ? '…' : buckets.length > 0 ? totalCount.toLocaleString() : '—'}
          size="lg"
        />

        <ul className="overall-risk-pie__legend">
          {loading && buckets.length === 0 && (
            <li className="overall-risk-pie__empty">Loading…</li>
          )}
          {!loading && buckets.length === 0 && (
            <li className="overall-risk-pie__empty">No data available</li>
          )}
          {(buckets.length > 0 || loading) &&
            normalized.map((b) => (
              <li key={b.band} className="overall-risk-pie__row">
                <span className="overall-risk-pie__row-left">
                  <span
                    className="overall-risk-pie__dot"
                    style={{ backgroundColor: OVERALL_RISK_COLORS[b.band] }}
                  />
                  <span className="overall-risk-pie__label">{b.band}</span>
                </span>
                <span className="overall-risk-pie__stat">
                  {b.percent}% · {b.count.toLocaleString()}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {concernInsight && (
        <div className="overall-risk-card__concern">
          <div className="overall-risk-card__concern-title">
            <AlertCircle size={20} aria-hidden />
            <span>Concern</span>
          </div>
          <p className="overall-risk-card__concern-text">{concernInsight.text}</p>
        </div>
      )}
    </>
  );
}

export function OverallRiskScoreChart({
  buckets,
  loading = false,
  selectedYear = '2026',
}: OverallRiskScoreChartProps) {
  return (
    <article className="overall-risk-card">
      <header className="overall-risk-card__header">
        <div className="overall-risk-card__title-row">
          <h3 className="overall-risk-card__title">Overall risk score</h3>
          <span className="overall-risk-card__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="overall-risk-card__info-popup" role="tooltip">
              {CHART_INFO.overallRiskScore}
            </span>
          </span>
        </div>
        <p className="overall-risk-card__subtitle">Workforce distribution by risk band</p>
      </header>

      {selectedYear === 'all' ? (
        <AllYearsOverallRisk />
      ) : (
        <SingleYearOverallRisk buckets={buckets} loading={loading} />
      )}
    </article>
  );
}
