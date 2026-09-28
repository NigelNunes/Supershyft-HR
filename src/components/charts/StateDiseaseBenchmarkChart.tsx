import { Info } from 'lucide-react';
import { ComingSoonPanel } from '../ui/ComingSoonPanel';
import { CHART_INFO } from '../../content/chartInfo';
import { hasStateBenchmarkData, shouldShowComingSoon } from '../../utils/comingSoon';
import type { YearOption } from '../layout/DashboardHeader';
import type { StateDiseaseBenchmark, StateDiseaseBenchmarkRow } from '../../services/campDashboardMappers';
import './StateDiseaseBenchmarkChart.css';

interface StateDiseaseBenchmarkChartProps {
  data: StateDiseaseBenchmark | null;
  loading?: boolean;
  selectedYear?: YearOption;
}

function formatAvg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function formatGap(company: number, state: number): string {
  const gap = Math.round((company - state) * 10) / 10;
  const abs = Number.isInteger(Math.abs(gap)) ? String(Math.abs(gap)) : Math.abs(gap).toFixed(1);
  if (gap > 0) return `+${abs}`;
  if (gap < 0) return `−${abs}`;
  return '0';
}

function scaleMax(rows: StateDiseaseBenchmarkRow[], overallCompany: number | null, overallState: number | null): number {
  const values = rows.flatMap((row) => [row.companyAverage, row.stateAverage]);
  if (overallCompany != null) values.push(overallCompany);
  if (overallState != null) values.push(overallState);
  const peak = Math.max(0, ...values);
  return Math.max(10, Math.ceil(peak / 10) * 10);
}

function BarPair({
  company,
  state,
  max,
}: {
  company: number;
  state: number;
  max: number;
}) {
  const width = (value: number) => `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
  return (
    <div className="state-benchmark__bars">
      <div className="state-benchmark__bar-row">
        <span className="state-benchmark__bar state-benchmark__bar--company" style={{ width: width(company) }} />
        <span className="state-benchmark__bar-value">{formatAvg(company)}</span>
      </div>
      <div className="state-benchmark__bar-row">
        <span className="state-benchmark__bar state-benchmark__bar--state" style={{ width: width(state) }} />
        <span className="state-benchmark__bar-value">{formatAvg(state)}</span>
      </div>
    </div>
  );
}

export function StateDiseaseBenchmarkChart({
  data,
  loading = false,
  selectedYear = '2026',
}: StateDiseaseBenchmarkChartProps) {
  const comingSoon = shouldShowComingSoon(selectedYear, loading, hasStateBenchmarkData(data));
  const rows = data?.rows ?? [];
  const max = scaleMax(rows, data?.overallCompany ?? null, data?.overallState ?? null);
  const companyName = data?.companyName || 'Company';
  const stateName = data?.state || 'state';
  const peerCount = data?.companiesCount ?? 0;
  const subtitle =
    peerCount > 0
      ? `${companyName} vs ${peerCount} other Bio-AI tested ${peerCount === 1 ? 'company' : 'companies'} in ${stateName}`
      : `${companyName} vs other Bio-AI tested companies in ${stateName}`;

  return (
    <article className="state-benchmark">
      <header className="state-benchmark__header">
        <div className="state-benchmark__title-row">
          <h3 className="state-benchmark__title">State disease benchmark</h3>
          <span className="state-benchmark__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="state-benchmark__info-popup" role="tooltip">
              {CHART_INFO.stateDiseaseBenchmark}
            </span>
          </span>
        </div>
        <p className="state-benchmark__subtitle">{subtitle}</p>
      </header>

      {comingSoon ? (
        <ComingSoonPanel />
      ) : loading ? (
        <p className="state-benchmark__empty">Loading state benchmark…</p>
      ) : rows.length === 0 ? (
        <p className="state-benchmark__empty">No state benchmark data available.</p>
      ) : (
        <>
          {data?.overallCompany != null && data.overallState != null && (
            <div className="state-benchmark__overall">
              <div>
                <p className="state-benchmark__overall-label">Overall elevated risk</p>
                <p className="state-benchmark__overall-gap">
                  <span
                    className={
                      data.overallCompany > data.overallState
                        ? 'state-benchmark__gap state-benchmark__gap--higher'
                        : 'state-benchmark__gap state-benchmark__gap--lower'
                    }
                  >
                    {formatGap(data.overallCompany, data.overallState)} pts vs state
                  </span>
                </p>
              </div>
              <BarPair company={data.overallCompany} state={data.overallState} max={max} />
            </div>
          )}

          <div className="state-benchmark__legend">
            <span className="state-benchmark__legend-item">
              <span className="state-benchmark__swatch state-benchmark__swatch--company" />
              {companyName}
            </span>
            <span className="state-benchmark__legend-item">
              <span className="state-benchmark__swatch state-benchmark__swatch--state" />
              {stateName} average
            </span>
          </div>

          <ul className="state-benchmark__list">
            {rows.map((row) => (
              <li key={row.key} className="state-benchmark__item">
                <span className="state-benchmark__category">{row.category}</span>
                <BarPair company={row.companyAverage} state={row.stateAverage} max={max} />
                <span
                  className={
                    row.companyAverage > row.stateAverage
                      ? 'state-benchmark__gap state-benchmark__gap--higher'
                      : 'state-benchmark__gap state-benchmark__gap--lower'
                  }
                >
                  {formatGap(row.companyAverage, row.stateAverage)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
