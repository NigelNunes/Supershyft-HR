import { Hourglass } from 'lucide-react';
import './ComingSoonPanel.css';

interface ComingSoonPanelProps {
  /** embed = inside an existing card; card = standalone glass panel; metric = compact KPI card */
  variant?: 'embed' | 'card' | 'metric';
  title?: string;
  description?: string;
}

export function ComingSoonPanel({
  variant = 'embed',
  title = 'Coming soon',
  description = 'This section will populate once camp data is available.',
}: ComingSoonPanelProps) {
  if (variant === 'metric') {
    return (
      <div className="coming-soon-panel coming-soon-panel--metric" role="status">
        <span className="coming-soon-panel__badge">Coming soon</span>
      </div>
    );
  }

  return (
    <div
      className={`coming-soon-panel coming-soon-panel--${variant}`}
      role="status"
      aria-label="Coming soon"
    >
      <div className="coming-soon-panel__inner">
        <div className="coming-soon-panel__icon-wrap" aria-hidden>
          <Hourglass size={22} strokeWidth={1.75} />
        </div>
        <span className="coming-soon-panel__badge">Coming soon</span>
        <p className="coming-soon-panel__title">{title}</p>
        <p className="coming-soon-panel__text">{description}</p>
      </div>
    </div>
  );
}
