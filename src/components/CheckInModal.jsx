import React, { useState } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';

export default function CheckInModal() {
  const { profile, measurements, performCheckIn } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    weight: profile?.weight || "", 
    chest: measurements.at(-1)?.chest || "", 
    arm: measurements.at(-1)?.arm || "", 
    waist: measurements.at(-1)?.waist || "" 
  });

  const lastWeight = measurements.at(-1)?.weight;
  const delta = lastWeight ? form.weight - lastWeight : 0;

  const handleSave = async () => {
    if (!form.weight || loading) return;
    setLoading(true);
    await performCheckIn(
      parseFloat(form.weight), 
      parseFloat(form.chest) || 0, 
      parseFloat(form.arm) || 0, 
      parseFloat(form.waist) || 0
    );
    // Modal will naturally unmount in App.jsx because lastCheckin was updated
  };

  return (
    <div className="fade-in" style={{ 
      position: "fixed", inset: 0, background: "#000000e0", zIndex: 300, 
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 
    }}>
      <div className="slide-up card" style={{ width: "100%", maxWidth: 380, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>وقت التحديث الأسبوعي</div>
        <div style={{ fontSize: 13, color: THEME.muted, marginBottom: 24 }}>مر 7 أيام على آخر تحديث. خلينا نشوف وصلنا لفين!</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8, textAlign: "right" }}>الوزن الحالي (kg)</div>
          <div style={{ position: "relative" }}>
            <input 
              type="number" 
              value={form.weight} 
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              style={{ 
                width: "100%", padding: "16px", borderRadius: 14, border: `2px solid ${THEME.blue}`, 
                background: THEME.card2, color: THEME.text, fontSize: 20, fontWeight: 800, textAlign: "center" 
              }}
            />
            {form.weight && lastWeight && (
              <div style={{ 
                position: "absolute", top: "50%", right: -60, transform: "translateY(-50%)",
                fontSize: 12, fontWeight: 800, color: delta > 0 ? THEME.green : (delta < 0 ? THEME.red : THEME.muted)
              }}>
                {delta > 0 ? `+${delta.toFixed(1)}kg` : `${delta.toFixed(1)}kg`}
                <div style={{ fontSize: 9 }}>{delta > 0 ? "مبروك 💪" : (delta < 0 ? "ركز أكتر 🍗" : "ثابت ⚖️")}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { label: "صدر", key: "chest" },
            { label: "ذراع", key: "arm" },
            { label: "خصر", key: "waist" }
          ].map(x => (
            <div key={x.key}>
              <div style={{ fontSize: 10, color: THEME.muted, marginBottom: 4 }}>{x.label}</div>
              <input 
                type="number" 
                placeholder="0"
                value={form[x.key]} 
                onChange={e => setForm(f => ({ ...f, [x.key]: e.target.value }))}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, textAlign: "center" }}
              />
            </div>
          ))}
        </div>

        <button 
          className="tap primary-btn" 
          onClick={handleSave}
          disabled={!form.weight || loading}
          style={{ 
            background: !form.weight || loading ? THEME.border : `linear-gradient(135deg, ${THEME.blue}, ${THEME.cyan})`,
            opacity: !form.weight || loading ? 0.7 : 1,
            cursor: !form.weight || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "جاري التحديث..." : "حفظ وتحديث الخطة ✅"}
        </button>
      </div>
    </div>
  );
}
