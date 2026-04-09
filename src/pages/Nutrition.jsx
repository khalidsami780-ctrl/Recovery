import React from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { calcNeeds } from '../utils/calc';
import Ring from '../components/Ring';

export default function Nutrition() {
  const { profile, log } = useStore();
  const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age, profile.goal) : null;

  const macros = [
    { label: "سعرات", val: needs?.calories || 0, unit: "kcal", color: THEME.orange },
    { label: "بروتين", val: needs?.protein || 0, unit: "g", color: THEME.blue },
    { label: "كارب", val: needs?.carbs || 0, unit: "g", color: THEME.green },
    { label: "دهون", val: needs?.fat || 0, unit: "g", color: THEME.purple },
  ];

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      {/* Macro Rings Grid */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">🔥 احتياجاتك اليومية المتبقية</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, justifyContent: "center" }}>
          {macros.map(m => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Ring value={m.val} max={m.val} color={m.color} size={100}>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.val}</div>
                <div style={{ fontSize: 10, color: THEME.muted }}>{m.unit}</div>
                <div style={{ fontSize: 10, color: THEME.muted2, fontWeight: 700 }}>{m.label}</div>
              </Ring>
            </div>
          ))}
        </div>
      </div>

      {/* Water Breakdown */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>💧 توزيع الميه</div>
          <div style={{ fontSize: 14, color: THEME.cyan, fontWeight: 800 }}>{needs?.waterMl}ml / يوم</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { label: "أساسي", val: profile?.weight ? Math.round(profile.weight * 40) : 0, color: THEME.cyan },
            { label: "مكملات", val: 500, color: THEME.blue },
            { label: "تمرين", val: 500, color: THEME.orange }
          ].map(x => (
            <div key={x.label} style={{ flex: 1, background: THEME.card2, borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: x.color }}>{x.val}</div>
              <div style={{ fontSize: 10, color: THEME.muted }}>{x.label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px", borderRadius: 14, background: THEME.cyan + "0d", border: `1px solid ${THEME.cyan}22` }}>
          <div style={{ fontSize: 12, color: THEME.cyan, fontWeight: 700, marginBottom: 4 }}>⚠️ نصيحة الميه</div>
          <div style={{ fontSize: 11, color: THEME.muted2, lineHeight: 1.6 }}>التركيز على شرب كوباية كل ساعتين بيحسن الامتصاص وبيريح الكليتين مع الكرياتين.</div>
        </div>
      </div>

      {/* Micronutrients */}
      <div className="card">
        <div className="card-title">🔬 أهم الميكروز لهدفك</div>
        {[
          { name: "زنك", val: "30mg", src: "كبدة، لحمة، كاجو", color: THEME.green },
          { name: "فيتامين D", val: "1000 IU", src: "شمس، بيض، سردين", color: THEME.orange },
          { name: "أوميجا 3", val: "2g", src: "سمك، بذور كتان", color: THEME.blue },
          { name: "ماغنسيوم", val: "400mg", src: "موز، كاكاو، لوز", color: THEME.purple }
        ].map((m, i, arr) => (
          <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${THEME.border}` : "none" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>{m.src}</div>
            </div>
            <div style={{ padding: "4px 10px", borderRadius: 8, background: m.color + "15", color: m.color, fontSize: 12, fontWeight: 800 }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
