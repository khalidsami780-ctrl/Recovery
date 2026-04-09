import React from 'react';
import { THEME } from '../utils/constants';

export default function YoutubeCard({ exerciseName }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial+arabic`;

  return (
    <a 
      href={searchUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="tap"
      style={{ 
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", 
        background: THEME.card2, borderRadius: 12, border: `1px solid ${THEME.border}`, 
        textDecoration: "none", marginBottom: 8, transition: "border-color 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = THEME.red}
      onMouseLeave={e => e.currentTarget.style.borderColor = THEME.border}
    >
      <div style={{ 
        width: 36, height: 36, borderRadius: "50%", background: THEME.red + "20", 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 
      }}>
        🎬
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{exerciseName}</div>
        <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>شاهد التمرين على يوتيوب ←</div>
      </div>
    </a>
  );
}
