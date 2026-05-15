import { CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { PositiveWins } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import './PositiveWinsPanel.css';

interface PositiveWinsPanelProps {
  data: PositiveWins;
}

export function PositiveWinsPanel({ data }: PositiveWinsPanelProps) {
  return (
    <ChartCard
      title="Positive wins"
      subtitle="Low-risk diseases, healthy habits & in-range profiles"
      info={CHART_INFO.positiveWins}
      insight={
        <InsightFooter
          tone="positive"
          text={`${data.lowRisk.length} disease areas are predominantly Healthy; ${data.healthyProfiles.length} lab profile groups show strong in-range rates workforce-wide.`}
        />
      }
    >
      <div className="positive-wins-grid">
        <section className="positive-wins-col">
          <h4>
            <Sparkles size={16} />
            Low-risk diseases
          </h4>
          <ul>
            {data.lowRisk.map((d) => (
              <li key={d.code}>
                <span className="positive-wins__name">{d.name}</span>
                <span className="positive-wins__badge">{d.riskStatus}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="positive-wins-col">
          <h4>
            <CheckCircle2 size={16} />
            Healthy habits
          </h4>
          <ul>
            {data.healthyHabits.map((h) => (
              <li key={h.habitLabel}>{h.habitLabel}</li>
            ))}
          </ul>
        </section>
        <section className="positive-wins-col">
          <h4>
            <Heart size={16} />
            Healthy blood profiles
          </h4>
          <ul>
            {data.healthyProfiles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      </div>
    </ChartCard>
  );
}
