import { Info } from 'lucide-react';
import './InfoTooltip.css';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="info-tooltip" tabIndex={0}>
      <Info size={14} aria-hidden />
      <span className="info-tooltip__popup" role="tooltip">
        {text}
      </span>
    </span>
  );
}
