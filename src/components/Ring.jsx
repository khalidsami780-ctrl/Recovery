import React from 'react';
import { THEME } from '../utils/constants';

export default function Ring({ value = 0, max = 1, color, size = 84, children }) {
  const cx = size / 2, cy = size / 2;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max((value || 0) / (max || 1), 0), 1);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle 
          cx={cx} 
          cy={cy} 
          r={r} 
          fill="none" 
          stroke={THEME.border} 
          strokeWidth={6} 
        />
        <circle 
          cx={cx} 
          cy={cy} 
          r={r} 
          fill="none" 
          stroke={color} 
          strokeWidth={6}
          strokeLinecap="round" 
          strokeDasharray={`${circ * pct} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        textAlign: "center"
      }}>
        {children}
      </div>
    </div>
  );
}
