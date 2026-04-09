import React from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';

export default function Care() {
  const { groomLog, toggleGroomStep, dermaWeekDays, groomStreak } = useStore();

  const dermaUsedThisWeek = dermaWeekDays.length;
  const canUseDermaToday = !groomLog.dermaRoller && dermaUsedThisWeek < 2;

  const groomingSteps = [
    {
      key: "facewash", icon: "🧼", label: "غسيل الوجه بالغسول", color: THEME.cyan,
      desc: "اغسل وجهك بالغسول Beardo ونشّفه كويس قبل أي حاجة تانية",
      required: true,
    },
    {
      key: "dermaRoller", icon: "🎯", label: "ديرما رولر (مرتين في الأسبوع)", color: THEME.purple,
      desc: canUseDermaToday
        ? "عقّم الرولر بكحول، استنى ينشف، بعدين مشّيه أفقي + رأسي + قطري لمدة دقيقتين براحة"
        : dermaUsedThisWeek >= 2
          ? `⚠️ استخدمته ${dermaUsedThisWeek} مرة الأسبوع ده — ما تعيدش قبل الأسبوع الجاي!`
          : "✅ استخدمته النهارده بالفعل",
      disabled: !canUseDermaToday && !groomLog.dermaRoller,
      optional: true,
    },
    {
      key: "oil", icon: "💧", label: "زيت اللحية Beardo", color: THEME.orange,
      desc: groomLog.dermaRoller
        ? "بعد 10 دقايق من الديرما: 3-4 نقط زيت، دلّك لحد ما البشرة تمتصه، اغسله بعد 3 ساعات أو الصبح"
        : "3-4 نقط زيت، دلّك على منطقة الذقن لحد ما البشرة تمتصه",
      tip: groomLog.oilTime ? `✅ حطيته الساعة ${groomLog.oilTime} — اغسله بعد 3 ساعات أو الصبح` : null,
    },
  ];

  return (
    <div className="slide-up" style={{ padding: "18px 16px" }}>
      {/* Header card with weekly tracker */}
      <div style={{ background: "linear-gradient(135deg, #150820, #0e1420)", borderRadius: 24, border: `1px solid ${THEME.purple}33`, padding: "24px 22px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, background: THEME.purple, borderRadius: "50%", filter: "blur(80px)", opacity: 0.1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🪒</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>روتين العناية بالدقن</div>
            <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}>بروتوكول Beardo — قبل النوم يومياً</div>
          </div>
          <div style={{ textAlign: "center", background: THEME.purple + "15", border: `1px solid ${THEME.purple}33`, borderRadius: 16, padding: "12px 18px" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: THEME.purple }}>{groomStreak.count}</div>
            <div style={{ fontSize: 9, color: THEME.muted, fontWeight: 700 }}>يوم متتالي 🔥</div>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "16px 18px", background: "#0b0f1a", borderRadius: 16, border: `1px solid ${THEME.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: THEME.muted2, fontWeight: 700 }}>🎯 ديرما رولر هذا الأسبوع</div>
            <div style={{ fontSize: 13, color: dermaUsedThisWeek >= 2 ? THEME.red : THEME.purple, fontWeight: 800 }}>{dermaUsedThisWeek} / 2</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i <= dermaUsedThisWeek ? THEME.purple : "#1a2535", boxShadow: i <= dermaUsedThisWeek ? `0 0 10px ${THEME.purple}44` : 'none' }} />
            ))}
          </div>
          {dermaUsedThisWeek >= 2 && (
            <div style={{ marginTop: 10, fontSize: 11, color: THEME.red, fontWeight: 700, textAlign: "center" }}>
              ⚠️ وصلت الحد الأسبوعي — استنى الأسبوع الجاي لسلامة بشرتك!
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📋 روتين الليلة</div>
        {groomingSteps.map((step, idx) => {
          const done = !!groomLog[step.key];
          const isDisabled = step.disabled;
          return (
            <div key={step.key}>
              <button 
                className={isDisabled ? "" : "tap"} 
                onClick={() => !isDisabled && toggleGroomStep(step.key)}
                style={{
                  width: "100%", textAlign: "right", padding: "18px", borderRadius: 18,
                  border: `1.5px solid ${done ? step.color + "55" : isDisabled ? THEME.border + "44" : THEME.border}`,
                  background: done ? step.color + "0d" : isDisabled ? "#080c12" : THEME.card2,
                  cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.5 : 1, transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 14, background: done ? step.color + "22" : "#0d1525", 
                    border: `1px solid ${done ? step.color + "44" : THEME.border}`, 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, color: done ? step.color : THEME.text, fontSize: 15 }}>{step.label}</div>
                      <div style={{ 
                        width: 28, height: 28, borderRadius: "50%", border: `2px solid ${done ? step.color : THEME.border}`, 
                        background: done ? step.color : "transparent", display: "flex", alignItems: "center", 
                        justifyContent: "center", color: "#fff" 
                      }}>
                        {done ? "✓" : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: THEME.muted, marginTop: 6, lineHeight: 1.6 }}>{step.desc}</div>
                    {step.tip && <div style={{ fontSize: 12, color: step.color, marginTop: 8, fontWeight: 700 }}>{step.tip}</div>}
                  </div>
                </div>
              </button>
              {idx < groomingSteps.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                  <div style={{ width: 2, height: 16, background: THEME.border, borderRadius: 1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Protocol Guide */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📖 بروتوكول الاستخدام الصح</div>
        {[
          { title: "1. النظافة أولاً", color: THEME.cyan, pts: ["اغسل وجهك بالغسول كويس", "جففه بمنشفة نظيفة تماماً"] },
          { title: "2. الديرما (مرتين/أسبوع)", color: THEME.purple, pts: ["عقّم الرولر بكحول الأول", "مشّيه في كل الاتجاهات دقيقتين", "ضغط خفيف جداً — مش لازم وجع"] },
          { title: "3. الزيت (يومياً)", color: THEME.orange, pts: ["3-4 نقط زيت Beardo", "تدليك لحد ما البشرة تمتصه", "اغسله بعد 3 ساعات أو الصبح"] }
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.title}</div>
            {s.pts.map(p => <div key={p} style={{ fontSize: 12, color: THEME.muted2, marginBottom: 4 }}>• {p}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}
