import React, { useState } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import WorkoutModal from '../components/WorkoutModal';
import { StreakCalendar } from '../components/Charts';

export default function Workout() {
  const { streak, log, groomLog } = useStore();
  const [showModal, setShowModal] = useState(false);

  const weeklyPlan = [
    { day: "الأحد", muscles: "صدر + ترايسبس", emoji: "💪", color: THEME.blue },
    { day: "الإثنين", muscles: "ظهر + بايسبس", emoji: "🦾", color: THEME.green },
    { day: "الثلاثاء", muscles: "راحة أو كارديو خفيف", emoji: "🧘", color: THEME.muted },
    { day: "الأربعاء", muscles: "كتف + رقبة", emoji: "🏋️", color: THEME.purple },
    { day: "الخميس", muscles: "أرجل كاملة", emoji: "🦵", color: THEME.orange },
    { day: "الجمعة", muscles: "Full Body أو راحة", emoji: "⚡", color: THEME.cyan },
    { day: "السبت", muscles: "راحة كاملة — نمو!", emoji: "💤", color: THEME.muted },
  ];

  const todayIndex = new Date().getDay(); // 0 is Sunday in JS

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>🏋️ التمرين</div>
        <button className="tap primary-btn" onClick={() => setShowModal(true)}
          style={{ width: "auto", padding: "10px 22px", background: `linear-gradient(135deg, ${THEME.blue}, ${THEME.cyan})`, fontSize: 14 }}>
          + تمرين جديد
        </button>
      </div>

      {/* Streak Dashboard */}
      <div style={{ background: "linear-gradient(135deg, #1c0f04, #2a1808)", borderRadius: 24, border: `1px solid ${THEME.orange}44`, padding: "24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 60 }}>🔥</div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 900, color: THEME.orange, lineHeight: 1 }}>{streak.count}</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>يوم متتالي</div>
          <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}>
            {streak.count === 0 ? "ابدأ أول تمرين النهارده! 💪" : "عاش! مكملين للقمة ⚡"}
          </div>
        </div>
      </div>

      {/* Personal Records (PRs) */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">🏅 أرقامك القياسية (PRs)</div>
        {Object.keys(prs).length === 0 ? (
          <div style={{ fontSize: 12, color: THEME.muted, textAlign: 'center', padding: '10px 0' }}>سجّل أول رقم قياسي ليك بعد التمرين! ⚡</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(prs).map(([name, data]) => (
              <div key={name} style={{ padding: '12px', borderRadius: 12, background: THEME.card2, border: `1px solid ${THEME.orange}33` }}>
                <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: THEME.orange }}>{data.weight}kg × {data.reps}</div>
                <div style={{ fontSize: 9, color: THEME.muted, marginTop: 4 }}>📅 {data.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Schedule */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📅 جدول الأسبوع (مبتدئ)</div>
        {weeklyPlan.map((d, i) => (
          <div key={i} style={{ 
            display: "flex", gap: 14, alignItems: "center", padding: "12px 0", 
            borderBottom: i < 6 ? `1px solid ${THEME.border}` : "none",
            opacity: todayIndex === i ? 1 : 0.6
          }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: 10, background: d.color + "15", 
              border: `1px solid ${todayIndex === i ? d.color : THEME.border}`, 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 
            }}>
              {d.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: todayIndex === i ? d.color : THEME.text }}>{d.day}</span>
                {todayIndex === i && <span style={{ fontSize: 10, color: d.color, fontWeight: 700 }}>اليوم ⭐</span>}
              </div>
              <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>{d.muscles}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-title">📊 نشاط الـ 30 يوم الأخيرة</div>
        <StreakCalendar 
          workoutDates={[]} /* Logic would need all logs for 30 days, simplified here */
          groomingDates={[]}
        />
        <div style={{ display: 'flex', gap: 15, marginTop: 12, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: THEME.green }} />
            <span style={{ fontSize: 10, color: THEME.muted }}>تمرين</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: THEME.purple }} />
            <span style={{ fontSize: 10, color: THEME.muted }}>عناية</span>
          </div>
        </div>
      </div>

      {showModal && <WorkoutModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
