import type { CSSProperties } from 'react';

type LaserFlowProps = {
  className?: string;
  /**
   * Primary accent color used across the beams.
   */
  color?: string;
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
}: LaserFlowProps) => {
  const rgbColor = parseHexToRgb(color) ?? '255, 121, 198';
  const style = {
    '--laser-color-rgb': rgbColor,
  } as CSSProperties;

  return (
    <div
      className={`laser-flow absolute inset-0 pointer-events-none ${className ?? ''}`}
      style={style}
    >
      <div className="laser-flow__backdrop" />
      <div className="laser-flow__beam-core" />
      <div className="laser-flow__beam-glow" />
      <div className="laser-flow__beam-fog laser-flow__beam-fog--left" />
      <div className="laser-flow__beam-fog laser-flow__beam-fog--right" />
      <div className="laser-flow__base-core" />
      <div className="laser-flow__base-glow" />
      <div className="laser-flow__base-grid" />

      <style jsx>{`
        .laser-flow {
          --laser-color-rgb: ${rgbColor};
          --laser-horizontal-offset: 25%;
          --laser-vertical-offset: 60%;
          overflow: hidden;
          background: radial-gradient(circle at 50% 120%, rgba(var(--laser-color-rgb), 0.08), transparent 60%),
            radial-gradient(circle at 20% 10%, rgba(var(--laser-color-rgb), 0.04), transparent 45%),
            radial-gradient(circle at 80% 5%, rgba(var(--laser-color-rgb), 0.05), transparent 45%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(12, 0, 24, 0.9));
          filter: saturate(120%);
        }

        .laser-flow__backdrop {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(var(--laser-color-rgb), 0.18), transparent 60%);
          opacity: 0.3;
          mix-blend-mode: screen;
        }

        .laser-flow__beam-core,
        .laser-flow__beam-glow {
          position: absolute;
          top: -10%;
          bottom: 35%;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 999px;
        }

        .laser-flow__beam-core {
          width: 7%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.8),
            rgba(var(--laser-color-rgb), 0.8) 45%,
            rgba(var(--laser-color-rgb), 0.15)
          );
          box-shadow: 0 0 40px rgba(var(--laser-color-rgb), 0.45), 0 0 120px rgba(var(--laser-color-rgb), 0.4);
          filter: blur(2px);
          animation: laser-flow-pulse 4s ease-in-out infinite;
        }

        .laser-flow__beam-glow {
          width: 18%;
          background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8), rgba(var(--laser-color-rgb), 0.6) 35%, transparent 75%);
          filter: blur(16px);
          opacity: 0.85;
          animation: laser-flow-glimmer 6s ease-in-out infinite alternate;
        }

        .laser-flow__beam-fog {
          position: absolute;
          bottom: 35%;
          width: 60%;
          height: 40%;
          background: radial-gradient(circle at 50% 100%, rgba(var(--laser-color-rgb), 0.35), transparent 70%);
          filter: blur(30px);
          opacity: 0.45;
          mix-blend-mode: screen;
          animation: laser-flow-fog 8s ease-in-out infinite alternate;
        }

        .laser-flow__beam-fog--left {
          left: -10%;
          transform: rotate(-4deg);
        }

        .laser-flow__beam-fog--right {
          right: -10%;
          transform: rotate(4deg);
          animation-delay: 1.8s;
        }

        .laser-flow__base-core {
          position: absolute;
          bottom: 22%;
          left: 50%;
          width: 70%;
          height: 26%;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at 50% 70%, rgba(255, 255, 255, 0.8), rgba(var(--laser-color-rgb), 0.75) 35%, transparent 75%);
          filter: blur(18px);
          opacity: 0.9;
        }

        .laser-flow__base-glow {
          position: absolute;
          bottom: 20%;
          left: 50%;
          width: 90%;
          height: 35%;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(var(--laser-color-rgb), 0.4), transparent 70%);
          filter: blur(32px);
          opacity: 0.6;
        }

        .laser-flow__base-grid {
          position: absolute;
          bottom: -5%;
          left: 50%;
          transform: translateX(-50%);
          width: 96%;
          height: 38%;
          border-radius: 28px;
          border: 2px solid rgba(var(--laser-color-rgb), 0.2);
          background:
            radial-gradient(circle at 1px 1px, rgba(var(--laser-color-rgb), 0.18) 0.5px, transparent 0.5px) 0 0 / 14px 14px,
            rgba(6, 0, 16, 0.85);
          box-shadow: 0 0 40px rgba(var(--laser-color-rgb), 0.2);
          overflow: hidden;
        }

        @keyframes laser-flow-pulse {
          0%,
          100% {
            opacity: 0.85;
            filter: blur(2px);
          }
          50% {
            opacity: 1;
            filter: blur(1px);
          }
        }

        @keyframes laser-flow-glimmer {
          0% {
            opacity: 0.75;
            transform: translateX(-50%) scaleY(1);
          }
          100% {
            opacity: 0.95;
            transform: translateX(-50%) scaleY(1.05);
          }
        }

        @keyframes laser-flow-fog {
          0% {
            opacity: 0.25;
            filter: blur(26px);
          }
          100% {
            opacity: 0.5;
            filter: blur(34px);
          }
        }
      `}</style>
    </div>
  );
};

export default LaserFlow;
