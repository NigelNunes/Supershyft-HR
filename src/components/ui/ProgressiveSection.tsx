import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EMPLOYEES_CAMP_YEAR } from '../../config/camp';
import './ProgressiveSection.css';

interface ProgressiveSectionProps {
  children: ReactNode;
  /** Mount immediately. Use for the first screen of a page. */
  eager?: boolean;
  /** Keep the placeholder up even when the section is on screen. */
  hold?: boolean;
  minHeight?: string;
  label?: string;
}

/**
 * Mount chart sections as they near the viewport so the page does not
 * fetch and paint every graph in one pass.
 */
export function ProgressiveSection({
  children,
  eager = false,
  hold = false,
  minHeight = '16rem',
  label = 'Loading chart',
}: ProgressiveSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const ready = !hold && (eager || seen);

  useEffect(() => {
    if (hold || eager || seen) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, hold, seen]);

  return (
    <div ref={ref} className="progressive-section">
      {ready ? (
        children
      ) : (
        <div
          className="progressive-section__skeleton"
          style={{ minHeight }}
          role="status"
          aria-label={label}
        />
      )}
    </div>
  );
}

export function SectionError({
  error,
  selectedYear,
  always = false,
}: {
  error: string | null;
  selectedYear?: string;
  always?: boolean;
}) {
  if (!error) return null;
  if (!always && selectedYear === EMPLOYEES_CAMP_YEAR) return null;
  return (
    <p className="dashboard-api-error" role="alert">
      {error}
    </p>
  );
}
