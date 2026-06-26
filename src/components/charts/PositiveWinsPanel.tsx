import { CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { PositiveWins } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import './PositiveWinsPanel.css';

interface PositiveWinsPanelProps {
  data: PositiveWins;
  loading?: boolean;
}

const EMPTY_POSITIVE_WINS: PositiveWins = {
  lowRisk: [],
  healthyHabits: [],
  healthyProfiles: [],
};

export function PositiveWinsPanel({ data, loading = false }: PositiveWinsPanelProps) {
  const display = loading ? EMPTY_POSITIVE_WINS : data;

  return (
    <ChartCard
      title="Positive wins"
      subtitle="Low-risk diseases, healthy habits & in-range profiles"
      info={CHART_INFO.positiveWins}
      insight={
        !loading ? (
          <InsightFooter
            tone="positive"
            text={`${display.lowRisk.length} disease areas are predominantly Healthy; ${display.healthyProfiles.length} lab profile groups show strong in-range rates workforce-wide.`}
          />
        ) : undefined
      }
    >
      {loading ? (
        <p className="positive-wins__loading">Loading positive wins…</p>
      ) : (
        <div className="positive-wins-grid">
          <section className="positive-wins-col">
            <h4>
              <Sparkles size={16} />
              Low-risk diseases
            </h4>
            <ul>
              {display.lowRisk.length > 0 ? (
                display.lowRisk.map((d) => (
                  <li key={d.code}>
                    <span className="positive-wins__name">{d.name}</span>
                    <span className="positive-wins__badge">{d.riskStatus}</span>
                  </li>
                ))
              ) : (
                <li className="positive-wins-col__empty">No low-risk diseases reported</li>
              )}
            </ul>
          </section>
          <section className="positive-wins-col">
            <h4>
              <CheckCircle2 size={16} />
              Healthy habits
            </h4>
            <ul>
              {display.healthyHabits.length > 0 ? (
                display.healthyHabits.map((h) => <li key={h.habitLabel}>{h.habitLabel}</li>)
              ) : (
                <li className="positive-wins-col__empty">No healthy habits reported</li>
              )}
            </ul>
          </section>
          <section className="positive-wins-col">
            <h4>
              <Heart size={16} />
              Healthy blood profiles
            </h4>
            <ul>
              {display.healthyProfiles.length > 0 ? (
                display.healthyProfiles.map((p) => <li key={p}>{p}</li>)
              ) : (
                <li className="positive-wins-col__empty">No healthy profiles reported</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </ChartCard>
  );
}
