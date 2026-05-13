'use client';
import React, { useEffect, useId, useState } from 'react';

export interface IStarterMeterProps {
  score: number;
  compact?: boolean;
  /** Small header mark (~36px tall) for nav; do not combine with `compact`. */
  logo?: boolean;
  /**
   * Decorative brown starter fill for branding (e.g. nav). Uses warm brown tones
   * independent of `score` so the mark does not imply a quiz result.
   */
  logoBrown?: boolean;
  /** When false, only the jar SVG is shown (e.g. navbar logo). */
  showLabel?: boolean;
}

type HealthLevel = 'dead' | 'contaminated' | 'at-risk' | 'needs-love' | 'alive';

function getHealth(score: number): HealthLevel {
  if (score <= -50) return 'contaminated';
  if (score < 0)    return 'dead';
  if (score < 30)   return 'at-risk';
  if (score < 60)   return 'needs-love';
  return 'alive';
}

const HEALTH_CONFIG: Record<HealthLevel, {
  label: string;
  fillColor: string;
  fillColor2: string;   // gradient end
  bubbleColor: string;
  labelColor: string;
  fillPct: number;      // 0–100
}> = {
  contaminated: {
    label: 'Contaminated',
    fillColor: '#e57373',
    fillColor2: '#c62828',
    bubbleColor: '#ef9a9a',
    labelColor: '#b94040',
    fillPct: 8,
  },
  dead: {
    label: 'Likely Dead',
    fillColor: '#c4956a',
    fillColor2: '#8b5e3c',
    bubbleColor: '#d4a87a',
    labelColor: '#8b5e3c',
    fillPct: 22,
  },
  'at-risk': {
    label: 'At Risk',
    fillColor: '#d4a84b',
    fillColor2: '#a07820',
    bubbleColor: '#e8c46a',
    labelColor: '#a07820',
    fillPct: 42,
  },
  'needs-love': {
    label: 'Needs Love',
    fillColor: '#8fbc6e',
    fillColor2: '#4a7c2f',
    bubbleColor: '#aed18e',
    labelColor: '#4a7c2f',
    fillPct: 65,
  },
  alive: {
    label: 'Thriving! 🎉',
    fillColor: '#5a9e5a',
    fillColor2: '#2d6e2d',
    bubbleColor: '#7ec07e',
    labelColor: '#2d6e2d',
    fillPct: 88,
  },
};

/** Rye / whole-wheat style starter — same family as `dead` tier, higher fill for logo use. */
const LOGO_BROWN_STYLE = {
  fillColor: '#c4956a',
  fillColor2: '#8b5e3c',
  bubbleColor: '#d4a87a',
  labelColor: '#8b5e3c',
  fillPct: 82,
} as const;

const StarterMeter: React.FC<IStarterMeterProps> = ({
  score,
  compact = false,
  logo = false,
  logoBrown = false,
  showLabel = true,
}) => {
  const clamped = Math.max(-100, Math.min(100, score));
  const health = getHealth(clamped);
  const cfgFromScore = HEALTH_CONFIG[health];
  const cfg =
    logo && logoBrown
      ? { ...cfgFromScore, ...LOGO_BROWN_STYLE }
      : cfgFromScore;

  const [animatedPct, setAnimatedPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedPct(cfg.fillPct), 100);
    return () => clearTimeout(t);
  }, [cfg.fillPct]);

  const isCompact = compact || logo;

  // Dimensions (logo fits ~40px row height including vertical padding)
  const W = logo ? 30 : compact ? 64 : 100;
  const H = logo ? 36 : compact ? 80 : 128;

  // Lid
  const lidW = W * 0.58;
  const lidH = H * 0.10;
  const lidX = (W - lidW) / 2;

  // Neck
  const neckW = W * 0.52;
  const neckH = H * 0.10;
  const neckX = (W - neckW) / 2;
  const neckY = lidH;

  // Body
  const bodyW = W * 0.82;
  const bodyH = H * 0.74;
  const bodyX = (W - bodyW) / 2;
  const bodyY = neckY + neckH;
  const r = bodyW * 0.10;

  // Fill
  const fillH = (bodyH * animatedPct) / 100;
  const fillY = bodyY + bodyH - fillH;

  // Wavy surface path (simple sine approximation using cubic bezier)
  const waveAmp = logo ? 1 : compact ? 2 : 3.5;
  const wavePath = fillH > (logo ? 2 : 4)
    ? `M ${bodyX} ${fillY}
       C ${bodyX + bodyW * 0.25} ${fillY - waveAmp}, ${bodyX + bodyW * 0.5} ${fillY + waveAmp}, ${bodyX + bodyW} ${fillY}
       L ${bodyX + bodyW} ${bodyY + bodyH}
       L ${bodyX} ${bodyY + bodyH}
       Z`
    : null;

  // Bubble positions inside the fill zone
  const rawBubbles = [
    { cx: bodyX + bodyW * 0.22, cy: bodyY + bodyH * 0.60, r: logo ? 1.0 : compact ? 2.2 : 3.2 },
    { cx: bodyX + bodyW * 0.50, cy: bodyY + bodyH * 0.50, r: logo ? 0.75 : compact ? 1.6 : 2.4 },
    { cx: bodyX + bodyW * 0.72, cy: bodyY + bodyH * 0.68, r: logo ? 0.85 : compact ? 1.8 : 2.8 },
    { cx: bodyX + bodyW * 0.38, cy: bodyY + bodyH * 0.75, r: logo ? 0.55 : compact ? 1.2 : 1.8 },
    { cx: bodyX + bodyW * 0.62, cy: bodyY + bodyH * 0.40, r: logo ? 0.65 : compact ? 1.4 : 2.0 },
  ];
  const visibleBubbles = rawBubbles.filter(b => b.cy > fillY + (logo ? 2 : 4));

  const instanceId = useId().replace(/:/g, '');
  const gradId = `fill-grad-${instanceId}`;
  const clipId = `jar-clip-${instanceId}`;

  const gapClass =
    !showLabel && isCompact ? 'gap-0' : isCompact ? 'gap-0.5' : 'gap-2';

  return (
    <div className={`flex flex-col items-center ${gapClass}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden={logo && logoBrown ? true : undefined}
        aria-label={logo && logoBrown ? undefined : `Starter health: ${cfg.label}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.fillColor} />
            <stop offset="100%" stopColor={cfg.fillColor2} />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={r} />
          </clipPath>
        </defs>

        {/* Lid */}
        <rect x={lidX - 2} y={0} width={lidW + 4} height={lidH * 0.6} rx={3} fill="#c8a97e" opacity={0.9} />
        <rect x={lidX} y={1} width={lidW} height={lidH * 0.28} rx={2} fill="white" opacity={0.22} />

        {/* Neck */}
        <rect x={neckX} y={neckY + lidH * 0.4} width={neckW} height={neckH * 0.7} rx={2} fill="#e8d5b7" stroke="#c8a97e" strokeWidth={1} />

        {/* Jar body background */}
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH}
          rx={r}
          fill="#fdf8f2"
          stroke="#c8a97e"
          strokeWidth={logo ? 1 : 1.5}
        />

        {/* Starter fill */}
        <g clipPath={`url(#${clipId})`}>
          {wavePath ? (
            <path
              d={wavePath}
              fill={`url(#${gradId})`}
              opacity={0.88}
              style={{
                transition: 'd 0.9s cubic-bezier(0.34,1.4,0.64,1)',
              }}
            />
          ) : (
            <rect
              x={bodyX}
              y={fillY}
              width={bodyW}
              height={fillH}
              fill={`url(#${gradId})`}
              opacity={0.88}
            />
          )}

          {/* Bubbles inside fill */}
          {animatedPct > (logo ? 12 : 15) && visibleBubbles.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={cfg.bubbleColor} opacity={0.65} />
          ))}
        </g>

        {/* Jar body border overlay */}
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH}
          rx={r}
          fill="none"
          stroke="#c8a97e"
          strokeWidth={logo ? 1 : 1.5}
        />

        {/* Glass shine */}
        <rect
          x={bodyX + bodyW * 0.07}
          y={bodyY + bodyH * 0.07}
          width={bodyW * 0.09}
          height={bodyH * 0.52}
          rx={3}
          fill="white"
          opacity={0.16}
        />
      </svg>

      {showLabel ? (
        <p
          className={`font-semibold tracking-wide ${logo ? 'text-[9px]' : compact ? 'text-[10px]' : 'text-sm'}`}
          style={{ color: cfg.labelColor }}
        >
          {cfg.label}
        </p>
      ) : null}
    </div>
  );
};

export default StarterMeter;
