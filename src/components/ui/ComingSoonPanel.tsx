import { Sparkles } from 'lucide-react';
import './ComingSoonPanel.css';

interface ComingSoonPanelProps {
  title?: string;
  description?: string;
}

export function ComingSoonPanel({
  title = 'More insights coming soon',
  description = 'Company average scores, risk analysis, oxidative stress, lab intelligence, and positive wins will appear here as they become available.',
}: ComingSoonPanelProps) {
  return (
    <section className="coming-soon-panel" aria-label="Coming soon">
      <div className="coming-soon-panel__inner">
        <div className="coming-soon-panel__icon-wrap" aria-hidden>
          <Sparkles size={32} strokeWidth={1.75} />
        </div>
        <span className="coming-soon-panel__badge">Coming soon</span>
        <h2 className="coming-soon-panel__title">{title}</h2>
        <p className="coming-soon-panel__text">{description}</p>
      </div>
    </section>
  );
}
