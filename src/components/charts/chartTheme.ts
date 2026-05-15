import { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PALETTE = {
  light: {
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    bgElevated: '#ffffff',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
    tooltipText: '#111827',
    tooltipMuted: '#4b5563',
    grid: '#e5e7eb',
    accent: '#0f6e56',
    danger: '#dc2626',
    shadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
  },
  dark: {
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#2a3441',
    bgElevated: '#151b23',
    tooltipBg: '#1f2937',
    tooltipBorder: '#374151',
    tooltipText: '#f9fafb',
    tooltipMuted: '#d1d5db',
    grid: '#2a3441',
    accent: '#2dd4a8',
    danger: '#f87171',
    shadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
  },
} as const;

export const CHART_COLORS = [
  '#E24B4A',
  '#5B9BD5',
  '#2D6A4F',
  '#4ECDC4',
  '#7F77DD',
  '#D85A30',
  '#378ADD',
  '#EF9F27',
];

export const RISK_COLORS: Record<string, string> = {
  Healthy: '#1D9E75',
  Increased: '#EF9F27',
  High: '#D85A30',
  'Very High': '#E24B4A',
};

/** Theme-aware Recharts tooltip + axis tokens (use inside chart components). */
export function useChartTheme() {
  const { theme } = useTheme();
  const c = PALETTE[theme];

  return useMemo(
    () => ({
      colors: c,
      tooltipProps: {
        contentStyle: {
          backgroundColor: c.tooltipBg,
          border: `1px solid ${c.tooltipBorder}`,
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: c.shadow,
          color: c.tooltipText,
          padding: '10px 12px',
        },
        labelStyle: {
          color: c.tooltipText,
          fontWeight: 600,
          marginBottom: 6,
          fontSize: 12,
        },
        itemStyle: {
          color: c.tooltipText,
          fontSize: 12,
          padding: 0,
        },
        wrapperStyle: { zIndex: 20, outline: 'none' },
        cursor: { fill: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' },
      },
      tick: (fontSize = 11) => ({ fill: c.textMuted, fontSize }),
      axisLabel: (fontSize = 11) => ({ fill: c.textMuted, fontSize }),
      gridStroke: c.grid,
      legendStyle: { fontSize: 12, color: c.textMuted },
    }),
    [c, theme],
  );
}

/** @deprecated Use useChartTheme().tooltipProps inside components */
export const tooltipStyle = {
  contentStyle: {
    background: 'var(--tooltip-bg)',
    border: '1px solid var(--tooltip-border)',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: 'var(--shadow-lg)',
    color: 'var(--tooltip-text)',
  },
  labelStyle: { color: 'var(--tooltip-text)', fontWeight: 600 },
  itemStyle: { color: 'var(--tooltip-muted)' },
};
