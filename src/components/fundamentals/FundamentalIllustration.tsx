import React from 'react';
import { FundamentalId } from '../../types/fundamentals';

interface FundamentalIllustrationProps {
  id: FundamentalId;
  className?: string;
}

export const FundamentalIllustration: React.FC<FundamentalIllustrationProps> = ({
  id,
  className = 'w-full h-40',
}) => {
  const paletteMap: Record<
    FundamentalId,
    { bgFrom: string; bgTo: string; accent: string; court: string }
  > = {
    serve: { bgFrom: '#0f172a', bgTo: '#1e3a8a', accent: '#f59e0b', court: '#2563eb' },
    reception: { bgFrom: '#0f172a', bgTo: '#0c4a6e', accent: '#38bdf8', court: '#0284c7' },
    setting: { bgFrom: '#0f172a', bgTo: '#312e81', accent: '#fbbf24', court: '#4f46e5' },
    attack: { bgFrom: '#0f172a', bgTo: '#7c2d12', accent: '#fb923c', court: '#ea580c' },
    block: { bgFrom: '#0f172a', bgTo: '#064e3b', accent: '#34d399', court: '#059669' },
    defense: { bgFrom: '#0f172a', bgTo: '#1e293b', accent: '#22d3ee', court: '#0891b2' },
    footwork: { bgFrom: '#0f172a', bgTo: '#1e3a8a', accent: '#a3e635', court: '#1d4ed8' },
  };

  const p = paletteMap[id];

  return (
    <svg
      viewBox="0 0 360 180"
      className={className}
      role="img"
      aria-label={`Ilustração técnica do fundamento ${id}`}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.bgFrom} />
          <stop offset="100%" stopColor={p.bgTo} />
        </linearGradient>
        <linearGradient id={`court-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={p.court} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill={`url(#bg-${id})`} />

      {/* Perspective court floor */}
      <polygon points="30,180 95,112 265,112 330,180" fill={`url(#court-${id})`} />
      <line x1="95" y1="112" x2="265" y2="112" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <line x1="65" y1="142" x2="295" y2="142" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="5 4" />

      {/* Net silhouette */}
      <line x1="78" y1="78" x2="282" y2="78" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
      <line x1="82" y1="102" x2="278" y2="102" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="80" y1="72" x2="80" y2="118" stroke="#94a3b8" strokeWidth="2.5" />
      <line x1="280" y1="72" x2="280" y2="118" stroke="#94a3b8" strokeWidth="2.5" />

      {/* Technique-specific trajectory + athlete silhouette */}
      {id === 'serve' && (
        <g>
          <path d="M 105 42 Q 195 16 285 95" fill="none" stroke={p.accent} strokeWidth="2.5" strokeDasharray="6 5" />
          <circle cx="105" cy="40" r="10" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Serving athlete */}
          <circle cx="92" cy="86" r="8" fill="#e2e8f0" />
          <path d="M 92 94 L 90 124 L 78 154 M 90 124 L 106 154 M 92 100 L 104 60" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 92 100 L 76 116" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {id === 'reception' && (
        <g>
          <path d="M 275 48 Q 205 90 154 114 Q 168 62 220 44" fill="none" stroke={p.accent} strokeWidth="2.5" strokeDasharray="6 5" />
          <circle cx="154" cy="112" r="10" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Low pass stance */}
          <circle cx="128" cy="100" r="8" fill="#e2e8f0" />
          <path d="M 124 108 L 114 132 L 96 156 M 114 132 L 136 156 M 126 114 L 152 122" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}

      {id === 'setting' && (
        <g>
          <path d="M 104 96 Q 145 58 176 64 Q 218 22 276 58" fill="none" stroke={p.accent} strokeWidth="2.5" strokeDasharray="6 5" />
          <circle cx="176" cy="60" r="10" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Setter overhead contact */}
          <circle cx="176" cy="90" r="8" fill="#e2e8f0" />
          <path d="M 176 98 L 176 128 L 164 156 M 176 128 L 190 156 M 174 104 L 166 76 M 178 104 L 186 76" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}

      {id === 'attack' && (
        <g>
          <path d="M 90 152 Q 130 144 156 124" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 186 44 L 278 122" fill="none" stroke={p.accent} strokeWidth="2.8" strokeDasharray="6 4" />
          <circle cx="186" cy="42" r="10.5" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Airborne spiker */}
          <circle cx="164" cy="64" r="8" fill="#e2e8f0" />
          <path d="M 162 72 L 156 100 L 144 122 M 156 100 L 168 124 M 164 76 L 180 48" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 160 76 L 142 96" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {id === 'block' && (
        <g>
          <circle cx="180" cy="48" r="10" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Two blockers forming a wall */}
          <circle cx="162" cy="84" r="7.5" fill="#e2e8f0" />
          <path d="M 162 92 L 162 120 L 154 148 M 162 120 L 170 148 M 156 96 L 158 58 M 168 96 L 168 58" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="198" cy="84" r="7.5" fill="#cbd5e1" />
          <path d="M 198 92 L 198 120 L 190 148 M 198 120 L 206 148 M 192 96 L 192 58 M 204 96 L 204 58" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {id === 'defense' && (
        <g>
          <path d="M 244 46 L 168 124 Q 186 78 214 58" fill="none" stroke={p.accent} strokeWidth="2.5" strokeDasharray="6 4" />
          <circle cx="168" cy="122" r="10" fill={p.accent} stroke="#ffffff" strokeWidth="1.5" />
          {/* Diving / low defender */}
          <circle cx="122" cy="124" r="8" fill="#e2e8f0" />
          <path d="M 114 128 L 80 146 M 126 128 L 160 128 M 80 146 L 60 138" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {id === 'footwork' && (
        <g>
          {/* Directional court arrows */}
          <path d="M 105 148 L 255 148" fill="none" stroke={p.accent} strokeWidth="2.5" strokeDasharray="5 4" />
          <polygon points="260,148 250,143 250,153" fill={p.accent} />
          <polygon points="100,148 110,143 110,153" fill={p.accent} />
          <circle cx="180" cy="84" r="8" fill="#e2e8f0" />
          <path d="M 180 92 L 180 120 L 158 148 M 180 120 L 202 148 M 176 98 L 162 114 M 184 98 L 198 114" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
    </svg>
  );
};
