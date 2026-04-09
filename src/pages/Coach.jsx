import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { THEME } from '../utils/constants';
import { calcNeeds } from '../utils/calc';
import YoutubeCard from '../components/YoutubeCard';

export default function Coach() {
  const { profile, log, groomLog, streak, groomStreak, messages, addMessage, dermaWeekDays } = useStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgEnd = useRef(null);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const assembleSystemPrompt = () => {
    const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age, profile.goal) : {};
    const dermaUsedThisWeek = dermaWeekDays.length;

    const ctx = `
الملف الشخصي: الاسم ${profile?.name}، الوزن ${profile?.weight}kg، الطول ${profile?.height}cm، العمر ${profile?.age} سنة، الهدف ${profile?.goal}
الاحتياجات اليومية: ${needs.calories} سعرة | بروتين ${needs.protein}g | كارب ${needs.carbs}g | دهون ${needs.fat}g | ماء ${needs.waterMl}ml
سجل اليوم:
- الماء المشروب: ${log.waterMl || 0}ml من ${needs.waterMl}ml
- الكرياتين: ${log.supplements?.creatine ? "✅ أخده" : "❌ لسه"}
- الزنك: ${log.supplements?.zinc ? "✅ أخده" : "❌ لسه"}
- التمارين: ${log.workouts?.length ? log.workouts.map(w => `${w.type} (${w.duration} دقيقة)`).join(", ") : "لسه مش اتمرن"}
- سلسلة التمارين: ${streak.count} يوم
روتين العناية اليوم:
- غسيل الوجه: ${groomLog.facewash ? "✅ تم" : "❌ لسه"}
- ديرما رولر: ${groomLog.dermaRoller ? "✅ تم" : "❌ لسه"} (عمل ${dermaUsedThisWeek}/2 الأسبوع ده)
- زيت اللحية: ${groomLog.oil ? "✅ تم" : "❌ لسه"}
- سلسلة العناية: ${groomStreak.count} يوم`.trim();

    return `أنت مدرب لياقة بدنية ومصري (خبير تغذية وعناية شخصية) لـ ${profile?.name}. هو شاب مصري عنده 21 سنة، نحيف جداً وعايز يضخم عضلاته وبيستخدم مجمموعة Beardo (ديرما رولر + زيت + غسول).

${ctx}

قواعد صارمة:
- اتكلم بس في اللياقة، التغذية، المكملات، والعناية (ديرما وزيت الدقن).
- الأسلوب: عامية مصرية، محفز، وعملي.
- لازم تعطي أرقام وكميات محددة دايماً.
- ممنوع تتكلم في أي حاجة تانية بره المواضيع دي.
- روتين الديرما رولر: مرتين بس في الأسبوع. الزيت يومياً قبل النوم. الغسول قبل أي حاجة.

بعد ما تقترح تمرين معين، اذكره بوضوح عشان السيستم يقدر يقترح له فيديوهات يوتيوب.`;
  };

  const exerciseKeywords = ["تمرين", "سكوات", "بنش", "ديدلفيت", "باي", "تراي", "كتف", "ظهر", "أرجل", "بطن", "عقلة", "ضغط", "لانجز", "بايسبس", "ترايسبس"];

  const detectExercises = (text) => {
    // Basic detection: look for mentions of exercises and split by commas or newlines if they look like a list
    const exercisesFound = [];
    const lines = text.split(/\n|,/);
    lines.forEach(line => {
      exerciseKeywords.forEach(kw => {
        if (line.includes(kw) && line.length < 50) {
          const cleaned = line.replace(/[•\d\-\.]/g, '').trim();
          if (cleaned && !exercisesFound.includes(cleaned)) {
            exercisesFound.push(cleaned);
          }
        }
      });
    });
    return exercisesFound.slice(0, 3);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    addMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: assembleSystemPrompt(),
          messages: [...messages.slice(-10), userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "معلش يا دودو، حصل مشكلة في السيرفر. جرب تاني!";
      
      const exercises = detectExercises(reply);
      addMessage({ role: "assistant", content: reply, exercises });
      
    } catch (e) {
      addMessage({ role: "assistant", content: "في مشكلة في الاتصال حالياً. اتأكد من النت وجرب تاني 💪" });
    }
    setLoading(false);
  };

  return (
    <div className="slide-up" style={{ height: "calc(100vh - 144px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-start" : "flex-end" }}>
            <div style={{ 
              maxWidth: "88%", padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 20px 5px" : "20px 20px 5px 20px", 
              background: msg.role === "user" ? `linear-gradient(135deg, ${THEME.blue}22, ${THEME.cyan}11)` : THEME.card, 
              border: `1px solid ${msg.role === "user" ? THEME.blue + "33" : THEME.border}`, 
              fontSize: 14, lineHeight: 1.6, color: THEME.text, whiteSpace: "pre-wrap" 
            }}>
              {msg.content}
            </div>
            {msg.exercises?.length > 0 && (
              <div style={{ width: "85%", marginTop: 8 }}>
                {msg.exercises.map(ex => <YoutubeCard key={ex} exerciseName={ex} />)}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <div className="card" style={{ padding: "12px 24px", color: THEME.green, animation: "pulse 1s infinite" }}>● ● ●</div>
          </div>
        )}
        <div ref={msgEnd} />
      </div>

      {/* Suggested chips */}
      <div style={{ padding: "10px 16px 6px", display: "flex", gap: 8, overflowX: "auto" }}>
        {["اقترح لي وجبات 🍗", "خطة تمرين 💪", "جرعة الكرياتين؟ ⚡", "استخدام الديرما 🎯"].map(q => (
          <button key={q} className="tap" onClick={() => setInput(q.replace(/ [^\s]+$/, ""))}
            style={{ whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 20, border: `1px solid ${THEME.border}`, background: THEME.card, color: THEME.muted2, fontSize: 12 }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${THEME.border}`, background: THEME.bg + "f0", backdropFilter: "blur(16px)", display: "flex", gap: 10 }}>
        <input 
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="اسأل مدربك AI..."
          style={{ flex: 1, padding: "14px 20px", borderRadius: 24, border: `1px solid ${THEME.border}`, background: THEME.card, color: THEME.text, fontSize: 14 }}
        />
        <button className="tap" onClick={handleSend} disabled={loading}
          style={{ 
            width: 48, height: 48, borderRadius: "50%", background: loading ? THEME.border : `linear-gradient(135deg, ${THEME.blue}, ${THEME.cyan})`, 
            color: "#fff", fontSize: 20, fontWeight: 900 
          }}>
          ↑
        </button>
      </div>
    </div>
  );
}
