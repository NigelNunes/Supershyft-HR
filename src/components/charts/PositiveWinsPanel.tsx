import { Check, FlaskConical, Info, Moon, ShieldCheck } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { PositiveWins } from '../../types';
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

type ColumnTone = 'emerald' | 'blue' | 'purple';

function WinChip({ label, tone }: { label: string; tone: ColumnTone }) {
  return (
    <span className={`positive-wins__chip positive-wins__chip--${tone}`}>
      <span className="positive-wins__chip-label">{label}</span>
      <Check size={12} strokeWidth={2.5} aria-hidden />
    </span>
  );
}

export function PositiveWinsPanel({ data, loading = false }: PositiveWinsPanelProps) {
  const display = loading ? EMPTY_POSITIVE_WINS : data;

  return (
    <article className="positive-wins">
      <header className="positive-wins__header">
        <div className="positive-wins__title-row">
          <h3 className="positive-wins__title">Positive Wins</h3>
          <span className="positive-wins__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="positive-wins__info-popup" role="tooltip">
              {CHART_INFO.positiveWins}
            </span>
          </span>
        </div>
        <p className="positive-wins__subtitle">
          Low-risk diseases, healthy habits & in-range profiles
        </p>
      </header>

      {loading ? (
        <p className="positive-wins__loading">Loading positive wins…</p>
      ) : (
        <div className="positive-wins__columns">
          <section className="positive-wins__col">
            <div className="positive-wins__col-head">
              <div className="positive-wins__icon positive-wins__icon--emerald" aria-hidden>
                <ShieldCheck size={28} strokeWidth={1.75} />
              </div>
              <h4 className="positive-wins__col-title positive-wins__col-title--emerald">
                Low-risk diseases
              </h4>
            </div>
            <div className="positive-wins__chips">
              {display.lowRisk.length > 0 ? (
                display.lowRisk.map((d) => (
                  <WinChip key={d.code} label={d.name} tone="emerald" />
                ))
              ) : (
                <p className="positive-wins__empty">No low-risk diseases reported</p>
              )}
            </div>
          </section>

          <section className="positive-wins__col">
            <div className="positive-wins__col-head">
              <div className="positive-wins__icon positive-wins__icon--blue" aria-hidden>
                <Moon size={28} strokeWidth={1.75} />
              </div>
              <h4 className="positive-wins__col-title positive-wins__col-title--blue">
                Healthy habits
              </h4>
            </div>
            <div className="positive-wins__chips">
              {display.healthyHabits.length > 0 ? (
                display.healthyHabits.map((h) => (
                  <WinChip key={h.habitLabel} label={h.habitLabel} tone="blue" />
                ))
              ) : (
                <p className="positive-wins__empty">No healthy habits reported</p>
              )}
            </div>
          </section>

          <section className="positive-wins__col">
            <div className="positive-wins__col-head positive-wins__col-head--profiles">
              <div className="positive-wins__icon positive-wins__icon--purple" aria-hidden>
                <FlaskConical size={28} strokeWidth={1.75} />
              </div>
              <h4 className="positive-wins__col-title positive-wins__col-title--purple">
                Healthy blood profiles
              </h4>
            </div>
            <div className="positive-wins__chips">
              {display.healthyProfiles.length > 0 ? (
                display.healthyProfiles.map((p) => (
                  <WinChip key={p} label={p} tone="purple" />
                ))
              ) : (
                <p className="positive-wins__empty">No healthy profiles reported</p>
              )}
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
