import React from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { getArabicDate } from '../utils/storage';

export default function Header() {
  const { profile, streak, groomStreak } = useStore();

  return (
    <div style={{ 
      padding: "18px 18px 14px", 
      position: "sticky", 
      top: 0, 
      background: THEME.bg + "f0", 
      backdropFilter: "blur(20px)", 
      zIndex: 50, 
      borderBottom: `1px solid ${THEME.border}` 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>{profile?.name || "Dodo"}</span>
            <span style={{ fontSize: 18 }}>👋</span>
          </div>
          <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>{getArabicDate()}</div>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          {/* Fitness Streak */}
          <div style={{ 
            background: streak?.count > 0 ? "#1c0f06" : THEME.card, 
            border: `1px solid ${streak?.count > 0 ? THEME.orange + "44" : THEME.border}`, 
            borderRadius: 14, padding: "8px 14px", textAlign: "center", minWidth: 56 
          }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>🔥</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: THEME.orange, lineHeight: 1.2 }}>{streak?.count || 0}</div>
            <div style={{ fontSize: 9, color: THEME.muted }}>يوم</div>
          </div>

          {/* Grooming Streak */}
          <div style={{ 
            background: groomStreak?.count > 0 ? "#150d1f" : THEME.card, 
            border: `1px solid ${groomStreak?.count > 0 ? THEME.purple + "44" : THEME.border}`, 
            borderRadius: 14, padding: "8px 12px", textAlign: "center", minWidth: 48 
          }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>🪒</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: THEME.purple, lineHeight: 1.2 }}>{groomStreak?.count || 0}</div>
            <div style={{ fontSize: 9, color: THEME.muted }}>يوم</div>
          </div>
        </div>
      </div>
    </div>
  );
}
