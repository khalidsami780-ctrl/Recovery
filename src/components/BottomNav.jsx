import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { THEME } from '../utils/constants';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "/", icon: "🏠", label: "الرئيسية" },
    { id: "/coach", icon: "🤖", label: "المدرب" },
    { id: "/nutrition", icon: "🥗", label: "التغذية" },
    { id: "/plan", icon: "📝", label: "الخطة" },
    { id: "/workout", icon: "🏋️", label: "التمرين" },
    { id: "/care", icon: "🪒", label: "العناية" },
    { id: "/progress", icon: "📈", label: "التقدم" },
  ];

  return (
    <div style={{ 
      position: "fixed", 
      bottom: 0, 
      left: "50%", 
      transform: "translateX(-50%)", 
      width: "100%", 
      maxWidth: 430, 
      background: THEME.card + "f8", 
      backdropFilter: "blur(20px)", 
      borderTop: `1px solid ${THEME.border}`, 
      display: "flex", 
      zIndex: 100 
    }}>
      {tabs.map(t => {
        const active = location.pathname === t.id;
        return (
          <button 
            key={t.id} 
            className="tap" 
            onClick={() => navigate(t.id)} 
            style={{ 
              flex: 1, 
              padding: "10px 0 16px", 
              border: "none", 
              background: "transparent", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 3 
            }}
          >
            <span style={{ 
              fontSize: 20, 
              filter: active ? "none" : "grayscale(80%) opacity(60%)", 
              transition: "filter .2s" 
            }}>
              {t.icon}
            </span>
            <span style={{ 
              fontSize: 9, 
              fontWeight: active ? 800 : 400, 
              color: active ? (t.id === "/care" ? THEME.purple : THEME.blue) : THEME.muted, 
              transition: "color .2s" 
            }}>
              {t.label}
            </span>
            {active && (
              <div style={{ 
                width: 4, 
                height: 4, 
                borderRadius: "50%", 
                background: t.id === "/care" ? THEME.purple : THEME.blue, 
                marginTop: -2 
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
