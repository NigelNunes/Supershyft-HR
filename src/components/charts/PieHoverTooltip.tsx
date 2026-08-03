import './PieHoverTooltip.css';

type PieTooltipPayload = {
  percent?: number;
  value?: number;
  count?: number;
  enrolled?: number;
};

type PieHoverTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: PieTooltipPayload;
  }>;
};

function resolveCountPercent(payload: PieTooltipPayload, rawValue: unknown) {
  const percentRaw =
    typeof payload.percent === 'number'
      ? payload.percent
      : typeof rawValue === 'number'
        ? rawValue
        : Number(rawValue);
  const percent = Number.isFinite(percentRaw) ? percentRaw : 0;

  const countRaw =
    typeof payload.count === 'number'
      ? payload.count
      : typeof payload.enrolled === 'number'
        ? payload.enrolled
        : null;
  const count = countRaw != null && Number.isFinite(countRaw) ? countRaw : null;

  return { count, percent };
}

/** Figma pie hover: large count + muted percent. */
export function PieHoverTooltip({ active, payload }: PieHoverTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const data = item?.payload ?? {};
  const { count, percent } = resolveCountPercent(data, item?.value);

  return (
    <div className="pie-hover-tooltip">
      <div className="pie-hover-tooltip__row">
        <span className="pie-hover-tooltip__count">
          {count != null ? count.toLocaleString() : '—'}
        </span>
        <span className="pie-hover-tooltip__percent">{percent}%</span>
      </div>
    </div>
  );
}
