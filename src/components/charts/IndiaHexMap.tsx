/**
 * Flat-top hex map of India.
 * Silhouette from a Douglas–Peucker simplification of datameet india-composite.
 */

import indiaOutline from '../../data/indiaOutline.json';

export type IndiaHexCityTone = 'red' | 'blue' | 'pink' | 'teal';

interface HexCell {
  points: string;
  fill: string;
  stroke: string;
}

interface ProjectedHub {
  name: string;
  tone: IndiaHexCityTone;
  x: number;
  y: number;
  radius: number;
}

const VIEW_W = 420;
const VIEW_H = 520;

/** Geographic bounds (degrees) — padded slightly around mainland + NE. */
const LON_MIN = 68.0;
const LON_MAX = 97.5;
const LAT_MIN = 6.8;
const LAT_MAX = 37.2;

/** Widen landmass slightly vs geographic equirectangular. */
const X_COMPRESS = 1.06;

const HUB_COLORS: Record<
  IndiaHexCityTone,
  { core: string; mid: string; edge: string }
> = {
  red: { core: '#ff8a3d', mid: '#ef4444', edge: '#b91c1c' },
  blue: { core: '#60a5fa', mid: '#3b82f6', edge: '#1d4ed8' },
  pink: { core: '#f472b6', mid: '#ec4899', edge: '#be185d' },
  teal: { core: '#2dd4bf', mid: '#14b8a6', edge: '#0f766e' },
};

const BASE_FILL = '#2a2e38';
const BASE_STROKE = '#5c6474';

function project(lon: number, lat: number): { x: number; y: number } {
  const padX = 8;
  const padY = 6;
  const w = VIEW_W - padX * 2;
  const h = VIEW_H - padY * 2;
  const x0 = padX + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * w;
  const y = padY + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * h;
  const cx = VIEW_W / 2;
  return { x: cx + (x0 - cx) * X_COMPRESS, y };
}

const INDIA_POLY = (indiaOutline as [number, number][]).map(([lon, lat]) =>
  project(lon, lat),
);

const CITY_HUBS_GEO: {
  name: string;
  lon: number;
  lat: number;
  tone: IndiaHexCityTone;
  radius: number;
}[] = [
  { name: 'GURUGRAM', lon: 77.03, lat: 28.46, tone: 'red', radius: 36 },
  { name: 'PUNE', lon: 73.86, lat: 18.52, tone: 'blue', radius: 38 },
  { name: 'HYDERABAD', lon: 78.49, lat: 17.39, tone: 'pink', radius: 40 },
  { name: 'BANGALORE', lon: 77.59, lat: 12.97, tone: 'teal', radius: 36 },
];

export const INDIA_HEX_CITY_HUBS: ProjectedHub[] = CITY_HUBS_GEO.map((hub) => {
  const { x, y } = project(hub.lon, hub.lat);
  return { name: hub.name, tone: hub.tone, x, y, radius: hub.radius };
});

/** Callout anchors as % of map viewBox — locked to real city projections. */
export const INDIA_HEX_CALLOUT_LAYOUT: Record<
  string,
  { top: string; left: string; tone: IndiaHexCityTone }
> = Object.fromEntries(
  INDIA_HEX_CITY_HUBS.map((hub) => [
    hub.name,
    {
      top: `${((hub.y / VIEW_H) * 100).toFixed(2)}%`,
      left: `${((hub.x / VIEW_W) * 100).toFixed(2)}%`,
      tone: hub.tone,
    },
  ]),
);

function pointInPolygon(x: number, y: number, poly: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Flat-top hexagon vertices. */
function hexagonPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(
      `${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`,
    );
  }
  return pts.join(' ');
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function glowForPoint(x: number, y: number): { fill: string; stroke: string } {
  let bestT = 0;
  let bestTone: IndiaHexCityTone | null = null;

  for (const hub of INDIA_HEX_CITY_HUBS) {
    const dist = Math.hypot(x - hub.x, y - hub.y);
    const t = Math.max(0, 1 - dist / hub.radius);
    const shaped = t * t * (3 - 2 * t);
    if (shaped > bestT) {
      bestT = shaped;
      bestTone = hub.tone;
    }
  }

  if (!bestTone || bestT < 0.08) {
    return { fill: BASE_FILL, stroke: BASE_STROKE };
  }

  const c = HUB_COLORS[bestTone];
  const fill =
    bestT > 0.55
      ? lerpColor(c.mid, c.core, (bestT - 0.55) / 0.45)
      : lerpColor(BASE_FILL, c.mid, bestT * 0.95);

  return {
    fill,
    stroke: bestT > 0.25 ? lerpColor(BASE_STROKE, c.mid, bestT * 0.4) : BASE_STROKE,
  };
}

function buildHexCells(): HexCell[] {
  // ~26–30 hexes across the widest band of India
  const size = 6.4;
  const dx = size * 1.5;
  const dy = size * Math.sqrt(3);
  const cells: HexCell[] = [];
  const cols = Math.ceil(VIEW_W / dx) + 2;
  const rows = Math.ceil(VIEW_H / dy) + 2;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const cx = 10 + col * dx;
      const cy = 8 + row * dy + (col % 2 === 0 ? 0 : dy / 2);
      if (!pointInPolygon(cx, cy, INDIA_POLY)) continue;
      const { fill, stroke } = glowForPoint(cx, cy);
      cells.push({
        points: hexagonPoints(cx, cy, size * 0.9),
        fill,
        stroke,
      });
    }
  }

  return cells;
}

const HEX_CELLS = buildHexCells();

const CALLOUT_GLOW: Record<IndiaHexCityTone, string> = {
  red: 'rgba(239,68,68,0.6)',
  blue: 'rgba(59,130,246,0.6)',
  pink: 'rgba(236,72,153,0.6)',
  teal: 'rgba(45,212,191,0.6)',
};

const CALLOUT_OUTLINE: Record<IndiaHexCityTone, string> = {
  red: 'rgba(239,68,68,0.3)',
  blue: 'rgba(59,130,246,0.3)',
  pink: 'rgba(236,72,153,0.3)',
  teal: 'rgba(45,212,191,0.3)',
};

export interface IndiaHexCityLabel {
  name: string;
  rank: number;
  tone: IndiaHexCityTone;
}

interface IndiaHexMapProps {
  cities?: IndiaHexCityLabel[];
}

const CALLOUT_W = 72;
const CALLOUT_H = 46;
/** Counters stage scale so boxes stay compact. */
const CALLOUT_SCALE_X = 0.62;
const CALLOUT_SCALE_Y = 0.78;

export function IndiaHexMap({ cities = [] }: IndiaHexMapProps) {
  const labels = cities.length
    ? cities
    : INDIA_HEX_CITY_HUBS.map((h) => ({ name: h.name, rank: 0, tone: h.tone }));

  return (
    <svg
      className="executive-map__svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        {INDIA_HEX_CITY_HUBS.map((hub) => (
          <radialGradient
            key={hub.tone}
            id={`india-hex-glow-${hub.tone}`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor={HUB_COLORS[hub.tone].core} stopOpacity="0.75" />
            <stop offset="40%" stopColor={HUB_COLORS[hub.tone].mid} stopOpacity="0.32" />
            <stop offset="100%" stopColor={HUB_COLORS[hub.tone].edge} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="india-hex-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#india-hex-soft-glow)" opacity="0.88">
        {INDIA_HEX_CITY_HUBS.map((hub) => (
          <circle
            key={`glow-${hub.tone}`}
            cx={hub.x}
            cy={hub.y}
            r={hub.radius * 1.4}
            fill={`url(#india-hex-glow-${hub.tone})`}
          />
        ))}
      </g>

      <g>
        {HEX_CELLS.map((cell, i) => (
          <polygon
            key={i}
            points={cell.points}
            fill={cell.fill}
            stroke={cell.stroke}
            strokeWidth={0.55}
          />
        ))}
      </g>

      {/* City boxes locked to projected lon/lat hubs */}
      <g className="executive-map__labels">
        {labels.map((city) => {
          const hub = INDIA_HEX_CITY_HUBS.find((h) => h.name === city.name);
          if (!hub) return null;
          return (
            <g
              key={city.name}
              transform={`translate(${hub.x} ${hub.y}) scale(${CALLOUT_SCALE_X} ${CALLOUT_SCALE_Y}) rotate(2.7) translate(${-CALLOUT_W / 2} ${-CALLOUT_H / 2})`}
            >
              <rect
                x={0}
                y={0}
                width={CALLOUT_W}
                height={CALLOUT_H}
                rx={8}
                ry={8}
                fill="rgba(0,0,0,0.82)"
                stroke={CALLOUT_OUTLINE[city.tone]}
                strokeWidth={1}
                style={{ filter: `drop-shadow(0 0 10px ${CALLOUT_GLOW[city.tone]})` }}
              />
              <text
                x={CALLOUT_W / 2}
                y={18}
                textAnchor="middle"
                fill="#94a3b8"
                fontFamily="DM Sans, sans-serif"
                fontSize={11}
                fontWeight={500}
                style={{ textTransform: 'uppercase' }}
              >
                {city.name}
              </text>
              <text
                x={CALLOUT_W / 2}
                y={36}
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="DM Sans, sans-serif"
                fontSize={16}
              >
                <tspan fontWeight={300}>#</tspan>
                <tspan fontWeight={800}>{city.rank}</tspan>
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
