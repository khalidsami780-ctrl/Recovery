import React, { useState } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { calcNeeds } from '../utils/calc';
import Ring from '../components/Ring';
import WorkoutModal from '../components/WorkoutModal';

export default function Home() {
  const { profile, log = {}, addWater, toggleSupp, groomLog = {}, groomStreak = {}, setSleep } = useStore();
  const [showModal, setShowModal] = useState(false);

  const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age, profile.goal) : null;
  const waterPct = needs ? Math.min((log.waterMl || 0) / needs.waterMl * 100, 100) : 0;

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "الهدف", val: needs ? `${needs.calories}` : "—", unit: "kcal", color: THEME.orange, icon: "🔥" },
          { label: "البروتين", val: needs ? `${needs.protein}g` : "—", unit: "يومي", color: THEME.blue, icon: "💪" },
          { label: "الماء", val: needs ? `${(needs.waterMl / 1000).toFixed(1)}L` : "—", unit: "مطلوب", color: THEME.cyan, icon: "💧" },
        ].map(x => (
          <div key={x.label} className="tap card" style={{ padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{x.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: x.color, lineHeight: 1 }}>{x.val}</div>
            <div style={{ fontSize: 10, color: THEME.muted, marginTop: 3 }}>{x.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Water Log */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>💧 الميه النهارده</div>
            <div style={{ fontSize: 12, color: THEME.muted, marginTop: 3 }}>
              <span style={{ color: THEME.cyan, fontWeight: 700, fontSize: 16 }}>{log.waterMl || 0}</span>
              <span style={{ color: THEME.muted }}> / {needs?.waterMl || 3000}ml</span>
            </div>
          </div>
          <Ring value={log.waterMl} max={needs?.waterMl || 3000} color={THEME.cyan} size={48}>
             <div style={{ fontSize: 11, fontWeight: 800, color: THEME.cyan }}>{Math.round(waterPct)}%</div>
          </Ring>
        </div>
        <div style={{ height: 8, background: "#0e1825", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${waterPct}%`, background: `linear-gradient(90deg, ${THEME.cyan}, #0891b2)`, borderRadius: 4, transition: "width .6s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[150, 250, 350, 500].map(ml => (
            <button key={ml} className="tap" onClick={() => addWater(ml, needs?.waterMl)} 
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.cyan, fontWeight: 700, fontSize: 12 }}>
              +{ml}
            </button>
          ))}
        </div>
      </div>

      {/* Supplements */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">💊 مكملاتك النهارده</div>
        {[
          { key: "creatine", name: "كرياتين", dose: "5g بعد التمرين", icon: "⚡", color: THEME.blue },
          { key: "zinc", name: "زنك", dose: "30mg مع وجبة", icon: "🌿", color: THEME.green },
        ].map(s => {
          const done = !!log.supplements?.[s.key];
          return (
            <button key={s.key} className="tap" onClick={() => toggleSupp(s.key)}
              style={{ 
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", 
                padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${done ? s.color + "55" : THEME.border}`, 
                background: done ? s.color + "0d" : THEME.card2, marginBottom: 10, textAlign: "right" 
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: done ? s.color : THEME.text, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>{s.dose}</div>
                </div>
              </div>
              <div style={{ 
                width: 26, height: 26, borderRadius: "50%", border: `2px solid ${done ? s.color : THEME.border}`, 
                background: done ? s.color : "transparent", display: "flex", alignItems: "center", 
                justifyContent: "center", color: "#fff" 
              }}>
                {done ? "✓" : ""}
              </div>
            </button>
          );
        })}
      </div>

      {/* Grooming */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🪒 روتين الليل</div>
          {groomStreak.count > 0 && <span style={{ fontSize: 12, color: THEME.purple, fontWeight: 700 }}>🔥 {groomStreak.count} يوم</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "غسيل", done: groomLog.facewash, icon: "🧼", color: THEME.cyan },
            { label: "ديرما", done: groomLog.dermaRoller, icon: "🎯", color: THEME.purple },
            { label: "زيت", done: groomLog.oil, icon: "💧", color: THEME.orange },
          ].map(x => (
            <div key={x.label} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, background: x.done ? x.color + "15" : THEME.card2, border: `1px solid ${x.done ? x.color + "44" : THEME.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{x.icon}</div>
              <div style={{ fontSize: 10, color: x.done ? x.color : THEME.muted, marginTop: 4, fontWeight: 700 }}>{x.done ? "✓ تم" : "باقي"}</div>
              <div style={{ fontSize: 10, color: THEME.muted, marginTop: 2 }}>{x.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep Tracker */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>😴 سجل نومك</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input 
              type="number" 
              placeholder="0" 
              value={log.sleepHours || ""}
              onChange={e => setSleep(parseFloat(e.target.value))}
              style={{ width: 50, padding: "8px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, textAlign: 'center' }}
            />
            <span style={{ fontSize: 12, color: THEME.muted }}>ساعة</span>
          </div>
        </div>
        {log.sleepHours && (
          <div style={{ padding: "12px", borderRadius: 12, background: log.sleepHours < 7 ? THEME.orange + "11" : THEME.green + "11", border: `1px solid ${log.sleepHours < 7 ? THEME.orange + "33" : THEME.green + "33"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: log.sleepHours < 7 ? THEME.orange : THEME.green }}>
                {log.sleepHours < 6 ? "⚠️ نوم قليل" : log.sleepHours < 7 ? "😐 نوم متوسط" : "✅ ممتاز"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: THEME.muted2, lineHeight: 1.5 }}>
              {log.sleepHours < 7 ? "💡 النوم القليل بيقلل هرمون النمو ويضر بناء العضلات. حاول تنام 8 ساعات." : "عاش! جسمك دلوقتي في أحسن حالاته للاستشفاء وبناء العضلات. 💪"}
            </div>
          </div>
        )}
      </div>

      {/* Quick Workout Log */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🏋️ تمارين النهارده</div>
          <button className="tap" onClick={() => setShowModal(true)}
            style={{ padding: "8px 16px", borderRadius: 10, background: THEME.blue, color: "#fff", fontWeight: 700, fontSize: 13 }}>
            تمرينت النهارده ✅
          </button>
        </div>
        {log.workouts?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: THEME.muted }}>
            <div style={{ fontSize: 40, opacity: 0.5 }}>🏃</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>لسه مش اتمرنت النهارده</div>
          </div>
        ) : (
          log.workouts.map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: THEME.card2, borderRadius: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: THEME.green }}>{w.type}</div>
                <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>{w.muscles?.join(" · ")}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: THEME.blue, fontWeight: 800, fontSize: 14 }}>{w.duration}د</div>
                <div style={{ fontSize: 10, color: THEME.muted }}>{w.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && <WorkoutModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
