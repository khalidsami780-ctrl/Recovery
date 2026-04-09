import React, { useState } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { WeightChart, StreakCalendar } from '../components/Charts';

export default function Progress() {
  const { weights, addWeight, streak, groomStreak, measurements, addMeasurement } = useStore();
  const [newWeight, setNewWeight] = useState("");

  const handleAddWeight = () => {
    if (!newWeight) return;
    addWeight(newWeight);
    setNewWeight("");
  };

  const badges = [
    { id: 'streak7', label: '7 أيام تمرين', desc: 'أول أسبوع التزام 🔥', icon: '🔥', earned: streak.count >= 7 },
    { id: 'groom7', label: '7 أيام عناية', desc: 'بداية تحسين المظهر ✨', icon: '🪒', earned: groomStreak.count >= 7 },
    { id: 'bulk1', label: 'أول كيلو!', desc: 'عاش يابطل، استمر 🥩', icon: '⚖️', earned: weights.length > 5 },
    { id: 'coach_fan', label: 'تحت رعاية الأخصائي', desc: 'كلمت المدرب 10 مرات', icon: '🤖', earned: true },
  ];

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📈 تتبع التقدم</div>

      {/* Weight Tracking */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>⚖️ تغير الوزن (آخر 14 يوم)</div>
          <div style={{ display: 'flex', gap: 8 }}>
             <input 
              type="number" 
              placeholder="0.0" 
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              style={{ width: 60, padding: "6px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, fontSize: 13 }}
            />
            <button className="tap" onClick={handleAddWeight} style={{ padding: "6px 12px", background: THEME.blue, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>سجّل</button>
          </div>
        </div>
        <WeightChart data={weights} />
      </div>

      {/* Body Measurements */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📏 قياسات الجسم (أسبوعي)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {['صدر', 'ذراع', 'خصر'].map(label => {
            const keys = { 'صدر': 'chest', 'ذراع': 'arm', 'خصر': 'waist' };
            return (
              <div key={label}>
                <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>{label}</div>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  id={`m-${keys[label]}`}
                  style={{ width: '100%', padding: "10px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, fontSize: 13, textAlign: 'center' }}
                />
              </div>
            );
          })}
        </div>
        <button 
          className="tap primary-btn"
          onClick={() => {
            const m = {
              chest: parseFloat(document.getElementById('m-chest').value),
              arm: parseFloat(document.getElementById('m-arm').value),
              waist: parseFloat(document.getElementById('m-waist').value),
            };
            if (m.chest && m.arm && m.waist) {
              addMeasurement(m);
              document.getElementById('m-chest').value = "";
              document.getElementById('m-arm').value = "";
              document.getElementById('m-waist').value = "";
            }
          }}
          style={{ padding: '12px', fontSize: 14, background: THEME.purple }}
        >
          حفظ القياسات
        </button>

        {measurements && measurements.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            {[...measurements].reverse().slice(0, 3).map((m, i, arr) => {
              const prev = measurements[measurements.indexOf(m) - 1];
              return (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${THEME.border}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>📅 {m.date}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { l: 'صدر', k: 'chest' }, { l: 'ذراع', k: 'arm' }, { l: 'خصر', k: 'waist' }
                    ].map(field => {
                      const val = m[field.k] || 0;
                      const prevVal = prev ? prev[field.k] : 0;
                      const delta = prevVal ? val - prevVal : 0;
                      return (
                        <div key={field.k} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{val}cm</div>
                          {delta !== 0 && (
                            <div style={{ fontSize: 10, color: delta > 0 ? THEME.green : THEME.red, fontWeight: 700 }}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}cm
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: THEME.muted }}>
            لا يوجد قياسات مسجلة بعد.
          </div>
        )}
      </div>

      {/* Persistence / Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: THEME.green }}>{streak.count}</div>
          <div style={{ fontSize: 10, color: THEME.muted, marginTop: 4 }}>أيام التمرين</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: THEME.purple }}>{groomStreak.count}</div>
          <div style={{ fontSize: 10, color: THEME.muted, marginTop: 4 }}>أيام العناية</div>
        </div>
      </div>

      {/* Monthly Streak Grid */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📅 سجل النشاط (آخر 35 يوم)</div>
        <StreakCalendar 
          workoutDates={[]} // Future improvement: fetch all logs
          groomingDates={[]}
        />
        <div style={{ marginTop: 12, fontSize: 11, color: THEME.muted2, textAlign: 'center' }}>
          الألوان: <span style={{ color: THEME.green }}>تمرين</span> | <span style={{ color: THEME.purple }}>عناية</span> | <span style={{ color: THEME.blue }}>الاثنين معاً</span>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <div className="card-title">🏆 أوسمة الإنجاز</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {badges.map(b => (
            <div key={b.id} style={{ 
              padding: '14px', borderRadius: 16, background: THEME.card2, 
              border: `1.5px solid ${b.earned ? THEME.orange + '44' : THEME.border}`,
              opacity: b.earned ? 1 : 0.5, textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: b.earned ? THEME.orange : THEME.text }}>{b.label}</div>
              <div style={{ fontSize: 10, color: THEME.muted, marginTop: 4 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
