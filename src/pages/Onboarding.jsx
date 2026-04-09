import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ 
    name: "Dodo", age: "", weight: "", height: "", 
    goal: "bulk", frequency: "4" 
  });

  const steps = [
    { key: "name", label: "اسمك إيه؟", sub: "هنناديك بيه طول الوقت", placeholder: "مثلاً: Dodo", type: "text", emoji: "👋", color: THEME.blue },
    { key: "age", label: "عمرك كام سنة؟", sub: "بيساعد في حساب الاحتياجات الصح", placeholder: "مثلاً: 21", type: "number", emoji: "🎂", color: THEME.purple },
    { key: "weight", label: "وزنك الحالي (kg)", sub: "مش مشكلة — إحنا هنغيره 💪", placeholder: "مثلاً: 58", type: "number", emoji: "⚖️", color: THEME.orange },
    { key: "height", label: "طولك (cm)", sub: "لازمه نحسب البي إم آر والسعرات", placeholder: "مثلاً: 175", type: "number", emoji: "📏", color: THEME.green },
    { key: "goal", label: "هدفك إيه؟", sub: "نشوف هنزود ولا هننشف", emoji: "🎯", color: THEME.cyan, isSelect: true, options: [
      { id: "bulk", label: "زيادة وزن وعضلات 🥩", desc: "أكل زيادة وتمرين قوي" },
      { id: "maintain", label: "تثبيت وزن ⚖️", desc: "تحسين شكل الجسم" },
      { id: "cut", label: "تنشيف ودهون أقل 🔥", desc: "عجز في السعرات" }
    ]},
    { key: "frequency", label: "هتتمرن كام يوم؟", sub: "عشان نظبطلك جدول الأسبوع", emoji: "🏋️", color: THEME.red, isSelect: true, options: [
      { id: "3", label: "3 أيام / أسبوع", desc: "يوم ويوم" },
      { id: "4", label: "4 أيام / أسبوع", desc: "متوازن" },
      { id: "5", label: "5 أيام / أسبوع", desc: "وحش الجيم" }
    ]}
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setProfile(form);
      navigate('/');
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={{ 
      background: THEME.bg, minHeight: "100vh", display: "flex", 
      flexDirection: "column", alignItems: "center", justifyContent: "center", 
      padding: "24px 20px" 
    }}>
      <div style={{ 
        position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", 
        width: 280, height: 280, background: currentStep.color, borderRadius: "50%", 
        filter: "blur(100px)", opacity: 0.07, pointerEvents: "none" 
      }} />

      <div style={{ width: "100%", maxWidth: 380 }} className="pop-in">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>💪 Project FitDodo</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {steps.map((_, i) => (
              <div key={i} style={{ 
                height: 6, borderRadius: 3, width: i === step ? 32 : 12, 
                background: i <= step ? currentStep.color : THEME.border, 
                transition: "all 0.35s ease" 
              }} />
            ))}
          </div>
        </div>

        <div key={step} className="slide-up card" style={{ padding: "36px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>{currentStep.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{currentStep.label}</div>
            <div style={{ fontSize: 13, color: THEME.muted }}>{currentStep.sub}</div>
          </div>

          {!currentStep.isSelect ? (
            <input 
              type={currentStep.type} 
              placeholder={currentStep.placeholder} 
              value={form[currentStep.key]}
              onChange={e => setForm(f => ({ ...f, [currentStep.key]: e.target.value }))}
              autoFocus
              style={{ 
                width: "100%", padding: "18px 22px", borderRadius: 18, 
                fontSize: 20, fontWeight: 700, border: `2px solid ${THEME.border}`, 
                background: "#090e16", color: THEME.text, textAlign: "center", 
                transition: "all .2s"
              }}
              onFocus={e => e.target.style.borderColor = currentStep.color}
              onBlur={e => e.target.style.borderColor = THEME.border}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentStep.options.map(opt => (
                <button 
                  key={opt.id}
                  className="tap"
                  onClick={() => setForm(f => ({ ...f, [currentStep.key]: opt.id }))}
                  style={{ 
                    padding: '14px 18px', borderRadius: 14, textAlign: 'right',
                    border: `1.5px solid ${form[currentStep.key] === opt.id ? currentStep.color : THEME.border}`,
                    background: form[currentStep.key] === opt.id ? currentStep.color + '15' : THEME.card2
                  }}
                >
                  <div style={{ fontWeight: 700, color: form[currentStep.key] === opt.id ? currentStep.color : THEME.text, fontSize: 15 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          )}

          <button 
            className="tap primary-btn"
            onClick={handleNext}
            style={{ 
              marginTop: 24, background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}cc)`,
              boxShadow: `0 8px 32px ${currentStep.color}40`
            }}
          >
            {isLast ? "🚀 ابدأ رحلتك!" : "التالي ←"}
          </button>
        </div>

        {step > 0 && (
          <button 
            onClick={() => setStep(s => s - 1)} 
            style={{ width: "100%", marginTop: 14, color: THEME.muted, fontSize: 14 }}
          >
            → رجوع
          </button>
        )}
      </div>
    </div>
  );
}
