import React from 'react';
import { THEME } from '../utils/constants';

// --- Weight Chart ---
export function WeightChart({ data = [] }) {
  if (data.length === 0) return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.muted, fontSize: 13 }}>
      لا يوجد بيانات وزن كافية ⚖️
    </div>
  );

  const padding = 20;
  const width = 360;
  const height = 180;
  
  // Last 14 entries
  const points = data.slice(-14);
  const values = points.map(p => p.value);
  const minV = Math.min(...values) - 2;
  const maxV = Math.max(...values) + 2;
  const range = maxV - minV || 1;

  const getX = (i) => padding + (i * ((width - padding * 2) / Math.max(1, points.length - 1)));
  const getY = (v) => height - padding - ((v - minV) / range * (height - padding * 2));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.value)}`).join(' ');
  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={THEME.blue} stopOpacity="0.3" />
            <stop offset="100%" stopColor={THEME.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
          <line 
            key={i} x1={padding} y1={getY(v)} x2={width - padding} y2={getY(v)} 
            stroke={THEME.border} strokeWidth="1" strokeDasharray="4 4" 
          />
        ))}

        {/* Path and Area */}
        <path d={areaData} fill="url(#weightGradient)" />
        <path d={pathData} fill="none" stroke={THEME.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={i}>
              <circle 
                cx={getX(i)} cy={getY(p.value)} r={isLast ? 5 : 3} 
                fill={isLast ? THEME.blue : THEME.card} 
                stroke={THEME.blue} strokeWidth="2" 
              />
              {isLast && (
                <text 
                  x={getX(i)} y={getY(p.value) - 10} textAnchor="middle" 
                  fill={THEME.blue} fontSize="12" fontWeight="800"
                >
                  {p.value}kg
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Streak Calendar ---
export function StreakCalendar({ workoutDates = [], groomingDates = [] }) {
  const width = 360;
  const cellSize = 30;
  const gap = 8;
  const cols = 6;
  const rows = 5; // 30 slots

  // Generate last 30 days
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px`, padding: '10px 0' }}>
      {days.map(date => {
        const hasWorkout = workoutDates.includes(date);
        const hasGrooming = groomingDates.includes(date);
        
        let background = THEME.card2;
        let border = THEME.border;
        
        if (hasWorkout && hasGrooming) {
          background = `linear-gradient(135deg, ${THEME.green}, ${THEME.purple})`;
          border = 'transparent';
        } else if (hasWorkout) {
          background = THEME.green;
          border = 'transparent';
        } else if (hasGrooming) {
          background = THEME.purple;
          border = 'transparent';
        }

        return (
          <div 
            key={date} 
            title={date}
            style={{ 
              aspectRatio: '1/1', background, borderRadius: '8px', 
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', color: (hasWorkout || hasGrooming) ? '#fff' : THEME.muted
            }}
          >
            {new Date(date).getDate()}
          </div>
        );
      })}
    </div>
  );
}
