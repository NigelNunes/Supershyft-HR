import type { ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';
import './ChartCard.css';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  info: string;
  insight?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  info,
  insight,
  actions,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <article className={`chart-card ${className}`.trim()}>
      <header className="chart-card__header">
        <div className="chart-card__titles">
          <h3>
            {title}
            <InfoTooltip text={info} />
          </h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="chart-card__actions">{actions}</div>}
      </header>
      <div className="chart-card__body">{children}</div>
      {insight && <footer className="chart-card__insight">{insight}</footer>}
    </article>
  );
}
