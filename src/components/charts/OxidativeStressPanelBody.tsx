import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { OxidativeStressByDept } from '../../types';
import { useChartTheme } from './chartTheme';
import {
  OXIDATIVE_BAND_COLORS,
  OXIDATIVE_BAND_LABELS,
  oxidativeElevatedPercent,
} from './oxidativeStressBands';
import './OxidativeStressChart.css';

interface OxidativeStressPanelBodyProps {
  data: OxidativeStressByDept;
  headcount?: number;
  loading?: boolean;
}

export function OxidativeStressPanelBody({
  data,
  headcount = 0,
  loading = false,
}: OxidativeStressPanelBodyProps) {
  const chart = useChartTheme();
  const elevated = oxidativeElevatedPercent(data);
  const healthyPercent = Math.round((data.low + data.moderate) * 10) / 10;
  const elevatedCount = headcount > 0 ? Math.round((headcount * elevated) / 100) : null;
  const healthyCount = headcount > 0 ? Math.round((headcount * healthyPercent) / 100) : null;

  const dominantBand = useMemo(
    () =>
      OXIDATIVE_BAND_LABELS.reduce((best, band) =>
        data[band.key] > data[best.key] ? band : best,
      ),
    [data],
  );

  const pieData = OXIDATIVE_BAND_LABELS.map(({ key, label }) => ({
    name: label,
    value: data[key],
    color: OXIDATIVE_BAND_COLORS[key],
  }));

  return (
    <>
      <ul className="oxidative-legend" aria-label="Severity bands">
        {OXIDATIVE_BAND_LABELS.map(({ key, label }) => (
          <li key={key}>
            <span
              className="oxidative-legend__dot"
              style={{ background: OXIDATIVE_BAND_COLORS[key] }}
            />
            {label}
          </li>
        ))}
        <li className="oxidative-legend__elevated-note">Elevated = High + Very High</li>
      </ul>

      <div className="oxidative-stress-layout">
        <div className="oxidative-stress-pie">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={3}
                stroke="none"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                {...chart.tooltipProps}
                formatter={(value) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  return [`${v}% of department`, 'Share'];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="oxidative-stress-pie__center" aria-hidden>
            <span className="oxidative-stress-pie__center-value">
              {loading ? '…' : `${elevated}%`}
            </span>
            <span className="oxidative-stress-pie__center-label">elevated</span>
          </div>
        </div>

        <ul className="oxidative-stress-breakdown">
          {OXIDATIVE_BAND_LABELS.map(({ key, label }) => (
            <li key={key}>
              <span
                className="oxidative-stress-breakdown__dot"
                style={{ background: OXIDATIVE_BAND_COLORS[key] }}
              />
              <span className="oxidative-stress-breakdown__label">{label}</span>
              <span className="oxidative-stress-breakdown__value">{data[key]}%</span>
            </li>
          ))}
        </ul>

        <div className="oxidative-stress-summary">
          <p className="oxidative-stress-summary__heading">Summary</p>

          <div className="oxidative-stress-mix" aria-label="Severity mix">
            <div className="oxidative-stress-mix__bar">
              {OXIDATIVE_BAND_LABELS.map(({ key }) => (
                <span
                  key={key}
                  className="oxidative-stress-mix__segment"
                  style={{ flexGrow: data[key], background: OXIDATIVE_BAND_COLORS[key] }}
                  title={`${OXIDATIVE_BAND_LABELS.find((b) => b.key === key)?.label}: ${data[key]}%`}
                />
              ))}
            </div>
            <p className="oxidative-stress-mix__caption">
              Largest group: <strong>{dominantBand.label}</strong> ({data[dominantBand.key]}%)
            </p>
          </div>

          <div className="oxidative-stress-stats">
            <div className="oxidative-stress-stat oxidative-stress-stat--healthy">
              <span className="oxidative-stress-stat__label">In Low / Moderate</span>
              <span className="oxidative-stress-stat__value">{healthyPercent}%</span>
              {healthyCount != null && (
                <span className="oxidative-stress-stat__sub">~{healthyCount.toLocaleString()} employees</span>
              )}
            </div>
            <div className="oxidative-stress-stat oxidative-stress-stat--elevated">
              <span className="oxidative-stress-stat__label">Elevated (High + Very High)</span>
              <span className="oxidative-stress-stat__value">{elevated}%</span>
              {elevatedCount != null && (
                <span className="oxidative-stress-stat__sub">~{elevatedCount.toLocaleString()} employees</span>
              )}
            </div>
          </div>

          <ul className="oxidative-stress-split">
            <li>
              <span>High</span>
              <span>{data.high}%</span>
            </li>
            <li>
              <span>Very High</span>
              <span>{data.veryHigh}%</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
