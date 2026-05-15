import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  TrendingUp,
  Users,
  Activity,
  Venus,
  Zap,
} from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { DataInsightCard, KeyInsightsData } from '../../types';
import { InfoTooltip } from '../ui/InfoTooltip';
import './KeyInsightsSection.css';

const CARD_ICONS: Record<string, typeof TrendingUp> = {
  growth: TrendingUp,
  risk: AlertTriangle,
  oxidative: Flame,
  positive: CheckCircle2,
  lifestyle: Activity,
  gender: Venus,
  emerging: Zap,
};

interface KeyInsightsSectionProps {
  data: KeyInsightsData;
}

function InsightCard({ card }: { card: DataInsightCard }) {
  const Icon = CARD_ICONS[card.id] ?? Users;
  return (
    <article className={`insight-card insight-card--${card.variant}`}>
      <header>
        <Icon size={18} className="insight-card__icon" />
        <h4>{card.title}</h4>
      </header>
      <ul>
        {card.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </article>
  );
}

export function KeyInsightsSection({ data }: KeyInsightsSectionProps) {
  return (
    <section className="key-insights-section">
      <header className="key-insights-section__header">
        <div>
          <h2>
            Key insights & recommendations
            <InfoTooltip text={CHART_INFO.keyInsights} />
          </h2>
          <p>Evidence from {new Date().getFullYear()} workforce health camp</p>
        </div>
      </header>

      <h3 className="key-insights-subheading">Data-backed insights</h3>
      <div className="insight-cards-grid">
        {data.insightCards.map((card) => (
          <InsightCard key={card.id} card={card} />
        ))}
      </div>

      <h3 className="key-insights-subheading">Recommendation tiers</h3>
      <div className="recommendation-tiers">
        {data.recommendationTiers.map((tier) => (
          <article key={tier.id} className={`recommendation-tier recommendation-tier--${tier.variant}`}>
            <header>
              <span className="recommendation-tier__label">{tier.title}</span>
              <span className="recommendation-tier__time">({tier.timeframe})</span>
            </header>
            <ul className="recommendation-tier__list">
              {tier.items.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} className="recommendation-tier__check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
