import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';

export default function WorkoutModal({ onClose }) {
  const { addWorkout } = useStore();
  const [form, setForm] = useState({ type: "", duration: "", muscles: [] });
  
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const toggleTimer = () => {
    if (isTimerRunning) {
      // Auto-fill duration when stopped
      setForm(f => ({ ...f, duration: Math.max(1, Math.round(seconds / 60)).toString() }));
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!form.type) return;
    await addWorkout(form);
    onClose();
  };

  const muscleOptions = ["صدر", "ظهر", "أرجل", "كتف", "بايسبس", "ترايسبس", "بطن", "سمانة"];

  return (
    <div className="fade-in" style={{ 
      position: "fixed", inset: 0, background: "#000000d0", zIndex: 200, 
      display: "flex", alignItems: "flex-end", justifyContent: "center" 
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      
      <div className="slide-up" style={{ 
        width: "100%", maxWidth: 430, background: "#0b1120", 
        borderRadius: "28px 28px 0 0", padding: "28px 24px 32px", 
        border: `1px solid ${THEME.border}`, borderBottom: "none" 
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: THEME.border, margin: "0 auto 24px" }} />
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>🏋️ تمرين جديد</div>

        {/* Timer Section */}
        <div style={{ 
          background: THEME.card2, borderRadius: 16, padding: 16, marginBottom: 20, 
          border: `1px solid ${isTimerRunning ? THEME.blue + '44' : THEME.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>مؤقت التمرين</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: isTimerRunning ? THEME.blue : THEME.text, fontFamily: 'monospace', marginBottom: 12 }}>
            {formatTime(seconds)}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button 
              className="tap"
              onClick={toggleTimer}
              style={{ 
                padding: "8px 20px", borderRadius: 10, background: isTimerRunning ? THEME.red : THEME.blue,
                color: '#fff', fontSize: 13, fontWeight: 700
              }}
            >
              {isTimerRunning ? 'إيقاف 🛑' : 'ابدأ المؤقت ⚡'}
            </button>
            <button 
              className="tap"
              onClick={() => { setSeconds(0); setIsTimerRunning(false); }}
              style={{ 
                padding: "8px 20px", borderRadius: 10, border: `1px solid ${THEME.border}`,
                color: THEME.muted, fontSize: 13, fontWeight: 700
              }}
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>نوع التمرين</div>
          <select 
            value={form.type} 
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            style={{ 
              width: "100%", padding: "14px 18px", borderRadius: 14, 
              border: `1px solid ${THEME.border}`, background: THEME.card2, 
              color: THEME.text, fontSize: 14
            }}
          >
            <option value="">اختار نوع التمرين...</option>
            <option>جيم — صدر + ترايسبس</option>
            <option>جيم — ظهر + بايسبس</option>
            <option>جيم — أرجل</option>
            <option>جيم — كتف + رقبة</option>
            <option>جيم — Full Body</option>
            <option>كارديو (ركض)</option>
            <option>كارديو (دراجة)</option>
            <option>تمارين بدون أدوات</option>
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>المدة بالدقائق</div>
          <input 
            type="number" 
            placeholder="مثلاً: 45" 
            value={form.duration}
            onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
            style={{ 
              width: "100%", padding: "14px 18px", borderRadius: 14, 
              border: `1px solid ${THEME.border}`, background: THEME.card2, 
              color: THEME.text, fontSize: 15, fontWeight: 700 
            }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 10 }}>العضلات المستهدفة</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {muscleOptions.map(m => {
              const sel = form.muscles?.includes(m);
              return (
                <button 
                  key={m} 
                  className="tap" 
                  onClick={() => setForm(p => ({ ...p, muscles: sel ? p.muscles.filter(x => x !== m) : [...(p.muscles || []), m] }))}
                  style={{ 
                    padding: "9px 16px", borderRadius: 10, 
                    border: `1.5px solid ${sel ? THEME.blue : THEME.border}`, 
                    background: sel ? THEME.blue + "22" : "transparent", 
                    color: sel ? THEME.blue : THEME.muted2, 
                    fontSize: 13
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 12 }}>🚀 سجّل رقم قياسي (PR) - اختياري</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              id="pr-ex" placeholder="بنش بريس"
              style={{ flex: 2, padding: "12px", borderRadius: 12, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, fontSize: 13 }}
            />
            <input 
              id="pr-wt" placeholder="60kg" type="number"
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, fontSize: 13 }}
            />
            <input 
              id="pr-rp" placeholder="8 عدات" type="number"
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${THEME.border}`, background: THEME.card2, color: THEME.text, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button 
            className="tap primary-btn" 
            onClick={async () => {
              const prEx = document.getElementById('pr-ex').value;
              const prWt = document.getElementById('pr-wt').value;
              const prRp = document.getElementById('pr-rp').value;
              if (prEx && prWt && prRp) {
                await useStore.getState().setPR(prEx, prWt, prRp);
              }
              handleSubmit();
            }}
            style={{ 
              flex: 1, background: `linear-gradient(135deg, ${THEME.blue}, ${THEME.cyan})`,
              boxShadow: `0 6px 24px ${THEME.blue}44`
            }}
          >
            ✅ سجّل التمرين
          </button>
          <button 
            className="tap" 
            onClick={onClose}
            style={{ 
              padding: "16px 22px", borderRadius: 16, border: `1px solid ${THEME.border}`, 
              color: THEME.muted
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
