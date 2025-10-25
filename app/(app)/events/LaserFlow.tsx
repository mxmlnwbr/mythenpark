import type { CSSProperties } from 'react';

type LaserFlowProps = {
  className?: string;
  /**
   * Primary accent color used across the beams.
   */
  color?: string;
  /**
   * Horizontal offset for the main beam (0 → left, 1 → right).
   */
  horizontalBeamOffset?: number;
  /**
   * Vertical offset for the secondary beam (0 → top, 1 → bottom).
   */
  verticalBeamOffset?: number;
};

const parseHexToRgb = (hex: string) => {
  const normalized = hex.trim().toLowerCase();
  const regex = /^#?(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})$/i;
  const match = normalized.match(regex);
  if (!match || !match.groups) return null;
  const { r, g, b } = match.groups;
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`;
};

/**
 * Lightweight animated laser background inspired by retro synthwave beams.
 * Pure CSS so it plays nicely with Next.js streaming and avoids extra deps.
 */
const LaserFlow = ({
  className,
  color = '#FF79C6',
  horizontalBeamOffset = 0.25,
  verticalBeamOffset = 0.6,
}: LaserFlowProps) => {
  const rgbColor = parseHexToRgb(color) ?? '255, 121, 198';
  const style = {
    '--laser-color-rgb': rgbColor,
    '--laser-horizontal-offset': `${horizontalBeamOffset * 100}%`,
    '--laser-vertical-offset': `${verticalBeamOffset * 100}%`,
  } as CSSProperties;

  return (
    <div
      className={`laser-flow absolute inset-0 pointer-events-none ${className ?? ''}`}
      style={style}
    >
      <div className="laser-flow__gradient" />
      <div className="laser-flow__beam laser-flow__beam--primary" />
      <div className="laser-flow__beam laser-flow__beam--secondary" />
      <div className="laser-flow__sparkle laser-flow__sparkle--one" />
      <div className="laser-flow__sparkle laser-flow__sparkle--two" />

      <style jsx>{`
        .laser-flow {
          --laser-color-rgb: ${rgbColor};
          --laser-horizontal-offset: 25%;
          --laser-vertical-offset: 60%;
          overflow: hidden;
          filter: hue-rotate(0deg);
          animation: laser-flow-hue 14s linear infinite;
        }

        .laser-flow__gradient {
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.35), transparent 55%),
            conic-gradient(from 180deg, rgba(var(--laser-color-rgb), 0.18), transparent 70%);
          animation: laser-flow-pulse 10s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .laser-flow__beam {
          position: absolute;
          width: 160%;
          height: 30%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(var(--laser-color-rgb), 0.45) 25%,
            rgba(var(--laser-color-rgb), 0.85) 50%,
            rgba(var(--laser-color-rgb), 0.45) 75%,
            transparent 100%
          );
          filter: blur(14px);
          opacity: 0.8;
          transform-origin: left center;
          mix-blend-mode: screen;
        }

        .laser-flow__beam--primary {
          top: var(--laser-vertical-offset);
          left: -20%;
          transform: rotate(-8deg) translateY(-50%);
          animation: laser-flow-sweep 8s ease-in-out infinite alternate;
        }

        .laser-flow__beam--secondary {
          top: 20%;
          left: var(--laser-horizontal-offset);
          transform: rotate(6deg) translate(-50%, -50%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(var(--laser-color-rgb), 0.35) 20%,
            rgba(var(--laser-color-rgb), 0.75) 50%,
            rgba(var(--laser-color-rgb), 0.35) 80%,
            transparent 100%
          );
          animation: laser-flow-sweep-secondary 12s ease-in-out infinite alternate;
        }

        .laser-flow__sparkle {
          position: absolute;
          width: 140%;
          height: 140%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.75) 0%,
            rgba(var(--laser-color-rgb), 0.4) 30%,
            transparent 60%
          );
          mix-blend-mode: screen;
          filter: blur(20px);
          opacity: 0.45;
        }

        .laser-flow__sparkle--one {
          top: -20%;
          left: -30%;
          animation: laser-flow-glimmer 9s ease-in-out infinite alternate;
        }

        .laser-flow__sparkle--two {
          bottom: -35%;
          right: -10%;
          animation: laser-flow-glimmer 7.5s ease-in-out infinite alternate;
        }

        @keyframes laser-flow-hue {
          0% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(20deg);
          }
          100% {
            filter: hue-rotate(0deg);
          }
        }

        @keyframes laser-flow-pulse {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.08);
          }
        }

        @keyframes laser-flow-sweep {
          0% {
            transform: rotate(-10deg) translateY(-45%);
            opacity: 0.65;
          }
          100% {
            transform: rotate(-4deg) translateY(-55%);
            opacity: 0.9;
          }
        }

        @keyframes laser-flow-sweep-secondary {
          0% {
            transform: rotate(8deg) translate(-48%, -52%);
            opacity: 0.55;
          }
          100% {
            transform: rotate(3deg) translate(-52%, -48%);
            opacity: 0.85;
          }
        }

        @keyframes laser-flow-glimmer {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default LaserFlow;
