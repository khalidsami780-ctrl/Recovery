import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];
const AR_DATE = new Date().toLocaleDateString("ar-EG", { weekday: "long", month: "long", day: "numeric" });

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

function calcNeeds(weight, height, age) {
  const w = parseFloat(weight) || 60;
  const h = parseFloat(height) || 170;
  const a = parseInt(age) || 22;
  const bmr = 10 * w + 6.25 * h - 5 * a + 5;
  const tdee = Math.round(bmr * 1.55);
  return {
    calories: tdee + 400,
    protein: Math.round(w * 2.2),
    carbs: Math.round(w * 4.5),
    fat: Math.round(w * 1.1),
    waterMl: Math.max(2500, Math.round((w * 40 + 500) / 250) * 250),
    zinc: 30,
  };
}

function getMealPlan(needs, weight) {
  if (!needs) return [];
  const w = parseFloat(weight) || 60;
  return [
    {
      id: "breakfast", time: "8:00 ص", emoji: "🌅", name: "الفطار",
      cal: Math.round(needs.calories * 0.25), protein: Math.round(needs.protein * 0.25), carbs: Math.round(needs.carbs * 0.25),
      items: ["3 بيض مقلي أو مسلوق", "2 توست أسمر + زبدة طبيعية", "كوباية لبن كامل الدسم (250ml)", "موزة كبيرة"],
      tip: "الفطار أهم وجبة في يومك — متعديهاش حتى لو مش جعان!",
    },
    {
      id: "snack1", time: "11:00 ص", emoji: "🥜", name: "سناك الصبح",
      cal: Math.round(needs.calories * 0.1), protein: Math.round(needs.protein * 0.08), carbs: Math.round(needs.carbs * 0.12),
      items: ["30g مكسرات (لوز + كاجو)", "3-4 تمرة", "تفاحة أو موزة"],
      tip: "السناك ده يحافظ على مستوى الطاقة ويمنعك تاكل قليل في الغداء.",
    },
    {
      id: "lunch", time: "2:00 م", emoji: "🍗", name: "الغداء",
      cal: Math.round(needs.calories * 0.35), protein: Math.round(needs.protein * 0.35), carbs: Math.round(needs.carbs * 0.35),
      items: [`${Math.round(w * 1.5 + 50)}g صدر فراخ مشوي أو بلدي`, "كوب أرز بني أو معكرونة إنتيجرال", "خضروات مطبوخة (جزر + بازلا + فلفل)", "سلطة خضراء بزيت زيتون"],
      tip: "دي أكبر وجبة في اليوم — مش ضروري تاكلها كلها مرة واحدة.",
    },
    {
      id: "preworkout", time: "5:30 م", emoji: "⚡", name: "قبل التمرين (45 دقيقة قبل)",
      cal: Math.round(needs.calories * 0.12), protein: Math.round(needs.protein * 0.05), carbs: Math.round(needs.carbs * 0.15),
      items: ["2 موزة", "كوباية عصير برتقال طبيعي (5g كرياتين فيه)", "3-4 تمرة"],
      tip: "الكارب السريع ده هيشحنك وهتحس بفرق كبير في التمرين.",
    },
    {
      id: "postworkout", time: "7:30 م", emoji: "💪", name: "بعد التمرين (فوراً)",
      cal: Math.round(needs.calories * 0.15), protein: Math.round(needs.protein * 0.2), carbs: Math.round(needs.carbs * 0.1),
      items: ["شيك بروتين أو كوباية لبن بالكاكاو", "موزة", "5g كرياتين (لو ما أخدتوش قبل)"],
      tip: "الـ 30 دقيقة دول هم أهم وقت لامتصاص البروتين وبناء العضلات.",
    },
    {
      id: "dinner", time: "9:30 م", emoji: "🌙", name: "العشاء",
      cal: Math.round(needs.calories * 0.13), protein: Math.round(needs.protein * 0.15), carbs: Math.round(needs.carbs * 0.05),
      items: ["150g تونة أو سمك بلطي مشوي", "خبز أسمر (2 توست)", "زبادي طبيعي (150g)", "سلطة خيار وطماطم"],
      tip: "البروتين قبل النوم بيساعد في بناء العضلات أثناء النوم (anabolic window).",
    },
  ];
}

async function storeGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storeSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─────────────────────────────────────────
// RING SVG
// ─────────────────────────────────────────
function Ring({ value = 0, max = 1, color, size = 84, children }) {
  const cx = size / 2, cy = size / 2;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max((value || 0) / (max || 1), 0), 1);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2535" strokeWidth={6} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────
export default function FitDodo() {
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState(null);
  const [log, setLog] = useState({ waterMl: 0, supplements: {}, workouts: [], macrosPct: 0 });
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [form, setForm] = useState({ name: "Dodo", weight: "", height: "", age: "" });
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({ type: "", duration: "", muscles: [] });
  const [notifStatus, setNotifStatus] = useState("default");
  const [fontsReady, setFontsReady] = useState(false);

  // Grooming state
  const [groomLog, setGroomLog] = useState({ facewash: false, dermaRoller: false, oil: false, oilTime: null });
  const [dermaWeekDays, setDermaWeekDays] = useState([]); // dates this week derma was used
  const [groomStreak, setGroomStreak] = useState({ count: 0, lastDate: null });

  const msgEnd = useRef(null);
  const reminderInterval = useRef(null);

  // ── Load storage
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    link.onload = () => setFontsReady(true);
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      ::-webkit-scrollbar{width:0}
      @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      @keyframes popIn{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
      @keyframes shimmer{0%{background-position:-200%}100%{background-position:200%}}
      @keyframes glow{0%,100%{box-shadow:0 0 8px #a855f744}50%{box-shadow:0 0 20px #a855f788}}
      .slide-up{animation:slideUp .28s cubic-bezier(.4,0,.2,1)}
      .fade-in{animation:fadeIn .3s ease}
      .pop-in{animation:popIn .25s cubic-bezier(.34,1.56,.64,1)}
      .tap:active{transform:scale(.97);transition:transform .1s}
      .glow-anim{animation:glow 2.5s infinite}
      input:focus{outline:none}
      select{outline:none;-webkit-appearance:none}
    `;
    document.head.appendChild(style);

    (async () => {
      const p = await storeGet("fd:profile");
      if (p) { setProfile(p); } else { setShowOnboard(true); }
      const l = await storeGet(`fd:log:${TODAY}`);
      if (l) setLog(l);
      const s = await storeGet("fd:streak");
      if (s) setStreak(s);
      const ch = await storeGet("fd:chat");
      if (ch?.length) {
        setMessages(ch);
      } else {
        setMessages([{ role: "assistant", content: "Dodo! 💪\nأنا مدربك الشخصي AI — بعرف كل حاجة عن نظامك الغذائي، تمارينك، مكملاتك، وروتين العناية بالدقن!\n\nقولي اتمرنت أو أكلت إيه النهارده، أو سألني عن روتين الديرما رولر والزيت — وأنا هساعدك في كل حاجة! 🔥" }]);
      }
      if ("Notification" in window) setNotifStatus(Notification.permission);

      // Load grooming data
      const gl = await storeGet(`fd:groom:${TODAY}`);
      if (gl) setGroomLog(gl);
      const dw = await storeGet(`fd:dermaWeek:${getWeekStart()}`);
      if (dw) setDermaWeekDays(dw);
      const gs = await storeGet("fd:groomStreak");
      if (gs) setGroomStreak(gs);
    })();
  }, []);

  const saveLog = async (nl) => { setLog(nl); await storeSet(`fd:log:${TODAY}`, nl); };

  const saveGroomLog = async (nl) => {
    setGroomLog(nl);
    await storeSet(`fd:groom:${TODAY}`, nl);
    // update groom streak
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    if (nl.oil) { // oil is the main daily step
      const newCount = groomStreak.lastDate === yStr ? groomStreak.count + 1 : (groomStreak.lastDate === TODAY ? groomStreak.count : 1);
      const ns = { count: newCount, lastDate: TODAY };
      setGroomStreak(ns);
      await storeSet("fd:groomStreak", ns);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.weight || !form.height) return;
    const p = { ...form };
    setProfile(p);
    await storeSet("fd:profile", p);
    setShowOnboard(false);
    const ns = { count: 1, lastDate: TODAY };
    setStreak(ns);
    await storeSet("fd:streak", ns);
  };

  const addWater = async (ml) => {
    const n = profile ? calcNeeds(profile.weight, profile.height, profile.age) : { waterMl: 3000 };
    const nw = Math.min((log.waterMl || 0) + ml, n.waterMl);
    await saveLog({ ...log, waterMl: nw });
  };

  const toggleSupp = async (key) => {
    const ns = { ...log.supplements, [key]: !log.supplements?.[key] };
    await saveLog({ ...log, supplements: ns });
  };

  const addWorkout = async () => {
    if (!workoutForm.type) return;
    const entry = { ...workoutForm, time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }), date: TODAY };
    const workouts = [...(log.workouts || []), entry];
    await saveLog({ ...log, workouts });
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    const newCount = streak.lastDate === yStr ? streak.count + 1 : (streak.lastDate === TODAY ? streak.count : 1);
    const ns = { count: newCount, lastDate: TODAY };
    setStreak(ns);
    await storeSet("fd:streak", ns);
    setShowWorkoutModal(false);
    setWorkoutForm({ type: "", duration: "", muscles: [] });
  };

  const toggleGroomStep = async (key) => {
    const updated = { ...groomLog, [key]: !groomLog[key] };
    if (key === "oil" && !groomLog.oil) {
      updated.oilTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    }
    // derma roller: update weekly tracker
    if (key === "dermaRoller" && !groomLog.dermaRoller) {
      const weekStart = getWeekStart();
      const newWeek = [...(dermaWeekDays || []).filter(d => d !== TODAY), TODAY];
      setDermaWeekDays(newWeek);
      await storeSet(`fd:dermaWeek:${weekStart}`, newWeek);
    }
    await saveGroomLog(updated);
  };

  const dermaUsedThisWeek = (dermaWeekDays || []).filter(d => d !== TODAY).length + (groomLog.dermaRoller ? 1 : 0);
  const canUseDermaToday = !groomLog.dermaRoller && dermaUsedThisWeek < 2;

  // ── AI Coach
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age) : {};
    const ctx = `
الملف الشخصي: الاسم ${profile?.name || "Dodo"}، الوزن ${profile?.weight}kg، الطول ${profile?.height}cm، العمر ${profile?.age} سنة
الاحتياجات اليومية: ${needs.calories} سعرة | بروتين ${needs.protein}g | كارب ${needs.carbs}g | دهون ${needs.fat}g | ماء ${needs.waterMl}ml
سجل اليوم:
- الماء المشروب: ${log.waterMl || 0}ml من ${needs.waterMl}ml
- الكرياتين: ${log.supplements?.creatine ? "✅ أخده" : "❌ لسه ما أخدوش"}
- الزنك: ${log.supplements?.zinc ? "✅ أخده" : "❌ لسه ما أخدوش"}
- التمارين: ${log.workouts?.length ? log.workouts.map(w => `${w.type} (${w.duration} دقيقة)`).join(", ") : "لسه مش اتمرن النهارده"}
- سلسلة الأيام: ${streak.count} يوم متتالي
روتين العناية اليوم:
- غسيل الوجه: ${groomLog.facewash ? "✅ عمله" : "❌ لسه"}
- ديرما رولر: ${groomLog.dermaRoller ? "✅ استخدمه" : "❌ لسه"} (استخدم ${dermaUsedThisWeek} مرة الأسبوع ده من 2)
- زيت اللحية: ${groomLog.oil ? `✅ حطه الساعة ${groomLog.oilTime}` : "❌ لسه"}
- سلسلة روتين العناية: ${groomStreak.count} يوم متتالي`.trim();

    const sys = `أنت مدرب لياقة بدنية ومستشار تغذية وعناية شخصية لـ ${profile?.name || "Dodo"}، شاب مصري عمره 21 سنة، نحيف جداً يريد اكتساب وزن وعضلات، وعنده مشكلة في استنبات الدقن ويستخدم منتجات Beardo (ديرما رولر 540 إبرة + زيت لحية طبيعي 30ml + غسول وجه).

${ctx}

روتين العناية بالدقن الموصوف من الدكتور:
- الروتين قبل النوم فقط
- اغسل الوجه بالغسول وجففه
- الديرما رولر: يُستخدم مرتين فقط في الأسبوع
- الزيت: يومياً بالليل
- قبل الديرما: عقّم الرولر بكحول أو ماء، استنى ينشف
- مشّي الديرما أفقياً ورأسياً وقطرياً لمدة دقيقتين براحة
- بعد الديرما بـ 10 دقايق: ضع الزيت (3-4 نقط)، دلّك لحد ما البشرة تمتصه، اغسله بعد 3 ساعات أو الصبح

مهامك:
1. اقتراح وجبات محددة بناءً على ما فعله اليوم
2. نصائح عملية عن الكرياتين والزنك (جرعات، توقيت، مع إيه)
3. تحفيز مستمر وقوي على الاستمرارية — ده أهم حاجة
4. إجابات تغذوية بالأرقام والكميات المحددة
5. خطط تمرين مناسبة للمبتدئين
6. إجابات متخصصة عن روتين الديرما رولر وزيت اللحية وكيفية الاستخدام الصح
7. نصايح عن تحفيز نمو الشعر وصحة البشرة

الأسلوب: عامية مصرية، ودي ومحفز، عملي ومباشر. أعطه أرقام محددة دايماً. لا تتكلم عن حاجات خارج نطاق اللياقة والتغذية والعناية الشخصية اللي بيتكلم عنها.`;

    const userMsg = { role: "user", content: chatInput };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: sys,
          messages: updated.slice(-12).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "معلش، في خطأ. حاول تاني.";
      const final = [...updated, { role: "assistant", content: reply }];
      setMessages(final);
      await storeSet("fd:chat", final.slice(-30));
    } catch {
      setMessages([...updated, { role: "assistant", content: "في مشكلة في الاتصال." }]);
    }
    setChatLoading(false);
  };

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  const requestNotifs = async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifStatus(p);
    if (p === "granted") {
      new Notification("FitDodo 💪", { body: "الإشعارات اتفعّلت! هفكرك بالميه والمكملات والوجبات وروتين العناية." });
      if (reminderInterval.current) clearInterval(reminderInterval.current);
      reminderInterval.current = setInterval(() => {
        const h = new Date().getHours(), m = new Date().getMinutes();
        if (m !== 0) return;
        if (h === 8) new Notification("🌅 وقت الفطار!", { body: "3 بيض + توست + لبن + موزة. متفوتوش!" });
        else if (h === 11) new Notification("🥜 سناك الصبح!", { body: "مكسرات + موزة — حافظ على طاقتك!" });
        else if (h === 14) new Notification("🍗 وقت الغداء!", { body: "صدر فراخ + أرز بني. أكبر وجبتك!" });
        else if (h === 17) new Notification("⚡ استعد للتمرين!", { body: "اتفطر قبل التمرين بـ 45 دقيقة!" });
        else if (h === 19) new Notification("💊 وقت المكملات!", { body: "أخدت الكرياتين والزنك؟" });
        else if (h === 22) new Notification("🪒 روتين الليل!", { body: "وقت روتين العناية بالدقن — غسيل + ديرما (لو يومه) + زيت!" });
        else if (h % 2 === 0 && h >= 8 && h <= 22) new Notification("💧 اشرب ميه!", { body: "كوباية ميه دلوقتي — الكرياتين يحتاج ترطيب!" });
      }, 60000);
    }
  };

  const needs = profile ? calcNeeds(profile.weight, profile.height, profile.age) : null;
  const mealPlan = getMealPlan(needs, profile?.weight);
  const waterPct = needs ? Math.min((log.waterMl || 0) / needs.waterMl * 100, 100) : 0;

  // ── Design tokens
  const F = "'Outfit', 'Segoe UI', sans-serif";
  const BG = "#06090f";
  const CARD = "#0c1118";
  const CARD2 = "#0e131c";
  const BD = "#18263a";
  const BL = "#3b82f6";
  const GR = "#22c55e";
  const OR = "#f97316";
  const CY = "#06b6d4";
  const PU = "#a855f7";
  const RO = "#f43f5e";
  const TX = "#e2e8f0";
  const MT = "#64748b";
  const MT2 = "#94a3b8";

  // ─────────────────────────────────────────
  // ONBOARDING
  // ─────────────────────────────────────────
  const steps = [
    { key: "name", label: "اسمك إيه؟", sub: "هنناديك بيه طول الوقت", placeholder: "مثلاً: Dodo", type: "text", emoji: "👋", color: BL },
    { key: "age", label: "عمرك كام سنة؟", sub: "بيساعد في حساب الاحتياجات الصح", placeholder: "مثلاً: 21", type: "number", emoji: "🎂", color: PU },
    { key: "weight", label: "وزنك الحالي (kg)", sub: "مش مشكلة — إحنا هنغيره 💪", placeholder: "مثلاً: 58", type: "number", emoji: "⚖️", color: OR },
    { key: "height", label: "طولك (cm)", sub: "لازمه نحسب البي إم آر والسعرات", placeholder: "مثلاً: 175", type: "number", emoji: "📏", color: GR },
  ];

  if (showOnboard) {
    const s = steps[onboardStep];
    const isLast = onboardStep === steps.length - 1;
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F, padding: "24px 20px", direction: "rtl" }}>
        <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: 280, height: 280, background: s.color, borderRadius: "50%", filter: "blur(100px)", opacity: 0.07, pointerEvents: "none" }} />
        <div style={{ width: "100%", maxWidth: 380, animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 52, marginBottom: 10, filter: "drop-shadow(0 0 20px #3b82f660)" }}>💪</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: TX, letterSpacing: -1 }}>FitDodo</div>
            <div style={{ fontSize: 14, color: MT, marginTop: 4 }}>مدربك الشخصي AI</div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ height: 6, borderRadius: 3, width: i === onboardStep ? 32 : 16, background: i < onboardStep ? s.color + "88" : i === onboardStep ? s.color : BD, transition: "all 0.35s ease" }} />
            ))}
          </div>
          <div key={onboardStep} style={{ background: CARD, borderRadius: 28, border: `1px solid ${BD}`, padding: "36px 28px", animation: "slideUp .3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{s.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: TX, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: MT }}>{s.sub}</div>
            </div>
            <input type={s.type} placeholder={s.placeholder} value={form[s.key]}
              onChange={e => setForm(f => ({ ...f, [s.key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && (isLast ? handleSaveProfile() : setOnboardStep(p => p + 1))}
              autoFocus
              style={{ width: "100%", padding: "18px 22px", borderRadius: 18, fontSize: 20, fontWeight: 700, border: `2px solid ${BD}`, background: "#090e16", color: TX, fontFamily: F, textAlign: "center", transition: "border-color .2s, box-shadow .2s", display: "block" }}
              onFocus={e => { e.target.style.borderColor = s.color; e.target.style.boxShadow = `0 0 0 4px ${s.color}18`; }}
              onBlur={e => { e.target.style.borderColor = BD; e.target.style.boxShadow = "none"; }}
            />
            <button onClick={() => isLast ? handleSaveProfile() : setOnboardStep(p => p + 1)}
              style={{ width: "100%", marginTop: 18, padding: "18px", borderRadius: 18, border: "none", background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: F, boxShadow: `0 8px 32px ${s.color}40` }}>
              {isLast ? "🚀 ابدأ رحلتك!" : "التالي ←"}
            </button>
          </div>
          {onboardStep > 0 && (
            <button onClick={() => setOnboardStep(p => p - 1)} style={{ width: "100%", marginTop: 14, padding: "12px", background: "transparent", border: "none", color: MT, fontSize: 14, cursor: "pointer", fontFamily: F }}>→ رجوع</button>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────
  const tabs = [
    { id: "home", icon: "🏠", label: "الرئيسية" },
    { id: "coach", icon: "🤖", label: "المدرب" },
    { id: "nutrition", icon: "🥗", label: "التغذية" },
    { id: "workout", icon: "🏋️", label: "التمرين" },
    { id: "care", icon: "🪒", label: "العناية" },
  ];

  const card = { background: CARD, borderRadius: 20, border: `1px solid ${BD}`, padding: 20 };

  // Grooming steps definition
  const groomingSteps = [
    {
      key: "facewash", icon: "🧼", label: "غسيل الوجه بالغسول", color: CY,
      desc: "اغسل وجهك بالغسول Beardo ونشّفه كويس قبل أي حاجة تانية",
      required: true,
    },
    {
      key: "dermaRoller", icon: "🎯", label: "ديرما رولر (مرتين في الأسبوع)", color: PU,
      desc: canUseDermaToday
        ? "عقّم الرولر بكحول، استنى ينشف، بعدين مشّيه أفقي + رأسي + قطري لمدة دقيقتين براحة"
        : dermaUsedThisWeek >= 2
          ? `⚠️ استخدمته ${dermaUsedThisWeek} مرة الأسبوع ده — ما تعيدش قبل الأسبوع الجاي!`
          : "✅ استخدمته النهارده بالفعل",
      disabled: !canUseDermaToday && !groomLog.dermaRoller,
      optional: true,
    },
    {
      key: "oil", icon: "💧", label: "زيت اللحية Beardo", color: OR,
      desc: groomLog.dermaRoller
        ? "بعد 10 دقايق من الديرما: 3-4 نقط زيت، دلّك لحد ما البشرة تمتصه، اغسله بعد 3 ساعات أو الصبح"
        : "3-4 نقط زيت، دلّك على منطقة الذقن لحد ما البشرة تمتصه",
      tip: groomLog.oilTime ? `✅ حطيته الساعة ${groomLog.oilTime} — اغسله بعد 3 ساعات أو الصبح` : null,
    },
  ];

  const groomDoneCount = [groomLog.facewash, groomLog.oil].filter(Boolean).length;
  const groomTotal = 2; // facewash + oil are required daily

  return (
    <div style={{ background: BG, minHeight: "100vh", maxWidth: 430, margin: "0 auto", fontFamily: F, color: TX, direction: "rtl", position: "relative" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 500, height: 320, background: BL, borderRadius: "50%", filter: "blur(180px)", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} />

      {/* ── HEADER */}
      <div style={{ padding: "18px 18px 14px", position: "sticky", top: 0, background: BG + "f0", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>{profile?.name || "Dodo"}</span>
              <span style={{ fontSize: 18 }}>👋</span>
            </div>
            <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>{AR_DATE}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Streak pill */}
            <div style={{ background: streak.count > 0 ? "#1c0f06" : CARD, border: `1px solid ${streak.count > 0 ? OR + "44" : BD}`, borderRadius: 14, padding: "8px 14px", textAlign: "center", minWidth: 56 }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>🔥</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: OR, lineHeight: 1.2 }}>{streak.count}</div>
              <div style={{ fontSize: 9, color: MT }}>يوم</div>
            </div>
            {/* Groom streak */}
            <div style={{ background: groomStreak.count > 0 ? "#150d1f" : CARD, border: `1px solid ${groomStreak.count > 0 ? PU + "44" : BD}`, borderRadius: 14, padding: "8px 12px", textAlign: "center", minWidth: 48 }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>🪒</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: PU, lineHeight: 1.2 }}>{groomStreak.count}</div>
              <div style={{ fontSize: 9, color: MT }}>يوم</div>
            </div>
            {/* Notif */}
            <button onClick={notifStatus !== "granted" ? requestNotifs : undefined}
              style={{ background: notifStatus === "granted" ? "#0d1f12" : CARD, border: `1px solid ${notifStatus === "granted" ? GR + "55" : BD}`, borderRadius: 14, padding: "8px 12px", cursor: "pointer", textAlign: "center", minWidth: 48 }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>{notifStatus === "granted" ? "🔔" : "🔕"}</div>
              <div style={{ fontSize: 9, color: notifStatus === "granted" ? GR : MT, marginTop: 2 }}>{notifStatus === "granted" ? "فعّال" : "تفعيل"}</div>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT */}
      <div style={{ paddingBottom: 82, position: "relative", zIndex: 1 }}>

        {/* ══════ HOME ══════ */}
        {tab === "home" && (
          <div className="slide-up" style={{ padding: "18px 16px" }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "الهدف", val: needs ? `${needs.calories}` : "—", unit: "kcal", color: OR, icon: "🔥" },
                { label: "البروتين", val: needs ? `${needs.protein}g` : "—", unit: "يومي", color: BL, icon: "💪" },
                { label: "الماء", val: needs ? `${(needs.waterMl / 1000).toFixed(1)}L` : "—", unit: "مطلوب", color: CY, icon: "💧" },
              ].map(x => (
                <div key={x.label} className="tap" style={{ ...card, padding: "14px 10px", textAlign: "center", cursor: "default" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{x.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: x.color, lineHeight: 1 }}>{x.val}</div>
                  <div style={{ fontSize: 10, color: MT, marginTop: 3 }}>{x.label}</div>
                </div>
              ))}
            </div>

            {/* ── Water card */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>💧 الماء النهارده</div>
                  <div style={{ fontSize: 12, color: MT, marginTop: 3 }}>
                    <span style={{ color: CY, fontWeight: 700, fontSize: 16 }}>{log.waterMl || 0}</span>
                    <span style={{ color: MT }}> / {needs?.waterMl || 3000}ml</span>
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `conic-gradient(${CY} ${waterPct * 3.6}deg, #1a2535 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: CARD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: CY }}>
                    {Math.round(waterPct)}%
                  </div>
                </div>
              </div>
              <div style={{ height: 8, background: "#0e1825", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ height: "100%", width: `${waterPct}%`, background: `linear-gradient(90deg, ${CY}, #0891b2)`, borderRadius: 4, transition: "width .6s ease" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[150, 250, 350, 500].map(ml => (
                  <button key={ml} className="tap" onClick={() => addWater(ml)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${BD}`, background: CARD2, color: CY, fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: F }}>+{ml}</button>
                ))}
              </div>
              {waterPct < 100 && (
                <div style={{ marginTop: 12, fontSize: 11, color: MT, textAlign: "center" }}>
                  باقي {Math.max(0, (needs?.waterMl || 3000) - (log.waterMl || 0))}ml للهدف
                  {log.supplements?.creatine && " ⚠️ الكرياتين يحتاج ميه زيادة!"}
                </div>
              )}
              {waterPct >= 100 && <div style={{ marginTop: 12, fontSize: 12, color: GR, textAlign: "center", fontWeight: 600 }}>✅ وصلت هدف الميه النهارده!</div>}
            </div>

            {/* ── Supplements */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💊 مكملاتك النهارده</div>
              {[
                { key: "creatine", name: "كرياتين", dose: "5g بعد التمرين مع عصير برتقال", icon: "⚡", color: BL },
                { key: "zinc", name: "زنك", dose: "25-30mg مع وجبة — مش على معدة فاضية", icon: "🌿", color: GR },
              ].map(s => {
                const done = !!log.supplements?.[s.key];
                return (
                  <button key={s.key} className="tap" onClick={() => toggleSupp(s.key)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${done ? s.color + "55" : BD}`, background: done ? s.color + "0d" : CARD2, cursor: "pointer", marginBottom: 10, fontFamily: F, textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: done ? s.color : TX, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>{s.dose}</div>
                      </div>
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${done ? s.color : BD}`, background: done ? s.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", transition: "all .25s" }}>{done ? "✓" : ""}</div>
                  </button>
                );
              })}
            </div>

            {/* ── Grooming quick status */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>🪒 روتين الليل</div>
                <button className="tap" onClick={() => setTab("care")}
                  style={{ padding: "7px 16px", borderRadius: 10, border: `1px solid ${PU}44`, background: PU + "11", color: PU, fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: F }}>
                  التفاصيل ←
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "غسيل", done: groomLog.facewash, icon: "🧼", color: CY },
                  { label: "ديرما", done: groomLog.dermaRoller, icon: "🎯", color: PU, optional: true },
                  { label: "زيت", done: groomLog.oil, icon: "💧", color: OR },
                ].map(x => (
                  <div key={x.label} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, background: x.done ? x.color + "15" : CARD2, border: `1px solid ${x.done ? x.color + "44" : BD}`, textAlign: "center" }}>
                    <div style={{ fontSize: 20 }}>{x.icon}</div>
                    <div style={{ fontSize: 10, color: x.done ? x.color : MT, marginTop: 4, fontWeight: 600 }}>{x.done ? "✓" : x.optional ? "اختياري" : "باقي"}</div>
                    <div style={{ fontSize: 10, color: MT, marginTop: 2 }}>{x.label}</div>
                  </div>
                ))}
              </div>
              {groomStreak.count > 0 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: PU + "0d", border: `1px solid ${PU}22`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔥</span>
                  <span style={{ fontSize: 12, color: PU }}>{groomStreak.count} يوم متتالي على روتين العناية!</span>
                </div>
              )}
            </div>

            {/* ── Today's workouts */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>🏋️ تمارين النهارده</div>
                <button className="tap" onClick={() => setShowWorkoutModal(true)}
                  style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: BL, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: F }}>+ أضف</button>
              </div>
              {!log.workouts?.length ? (
                <div style={{ textAlign: "center", padding: "22px 0", color: MT }}>
                  <div style={{ fontSize: 40, marginBottom: 8, opacity: .5 }}>🏃</div>
                  <div style={{ fontSize: 13 }}>لسه مش اتمرنت النهارده</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>سجّل تمرينك وهتحافظ على سلسلتك 🔥</div>
                </div>
              ) : log.workouts.map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: CARD2, borderRadius: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: GR }}>{w.type}</div>
                    <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>{w.muscles?.join(" · ")}</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ color: BL, fontWeight: 700, fontSize: 14 }}>{w.duration}د</div>
                    <div style={{ fontSize: 10, color: MT }}>{w.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ COACH ══════ */}
        {tab === "coach" && (
          <div className="slide-up" style={{ height: "calc(100vh - 144px)", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-start" : "flex-end" }}>
                  {msg.role === "assistant" && <div style={{ fontSize: 11, color: MT, marginBottom: 4, marginRight: 4 }}>🤖 مدربك AI</div>}
                  <div style={{ maxWidth: "88%", padding: "13px 16px", borderRadius: msg.role === "user" ? "18px 18px 18px 5px" : "18px 18px 5px 18px", background: msg.role === "user" ? `linear-gradient(135deg, ${BL}22, ${CY}11)` : CARD, border: `1px solid ${msg.role === "user" ? BL + "33" : BD}`, fontSize: 14, lineHeight: 1.7, color: TX, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <div style={{ padding: "12px 20px", background: CARD, borderRadius: "18px 18px 5px 18px", border: `1px solid ${BD}`, color: GR, fontSize: 13, animation: "pulse 1.5s infinite" }}>● ● ●</div>
                </div>
              )}
              <div ref={msgEnd} />
            </div>

            {/* Quick prompts */}
            <div style={{ padding: "10px 16px 6px", display: "flex", gap: 8, overflowX: "auto" }}>
              {[
                "اقترح لي وجبات النهارده 🍗",
                "خطة تمرين للمبتدئين 💪",
                "ازاي آخد الكرياتين؟ ⚡",
                "كيفية استخدام الديرما رولر 🎯",
                "الزيت بيشتغل إزاي؟ 💧",
                "أكلات تزود الوزن 🥩",
                "محتاج تحفيز! 🔥",
              ].map(q => (
                <button key={q} className="tap" onClick={() => setChatInput(q.replace(/ [^\s]+$/, ""))}
                  style={{ whiteSpace: "nowrap", padding: "9px 16px", borderRadius: 20, border: `1px solid ${BD}`, background: CARD, color: MT2, fontSize: 12, cursor: "pointer", fontFamily: F }}>
                  {q}
                </button>
              ))}
            </div>

            <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${BD}`, background: BG + "f0", backdropFilter: "blur(16px)", display: "flex", gap: 10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="اسأل عن الأكل، التمرين، أو روتين الدقن..."
                style={{ flex: 1, padding: "13px 18px", borderRadius: 22, border: `1px solid ${BD}`, background: CARD, color: TX, fontSize: 14, fontFamily: F, transition: "border-color .2s" }}
                onFocus={e => e.target.style.borderColor = BL}
                onBlur={e => e.target.style.borderColor = BD}
              />
              <button className="tap" onClick={sendChat} disabled={chatLoading}
                style={{ padding: "13px 20px", borderRadius: 22, border: "none", background: chatLoading ? BD : `linear-gradient(135deg, ${BL}, ${CY})`, color: "#fff", fontWeight: 800, cursor: chatLoading ? "not-allowed" : "pointer", fontSize: 18, fontFamily: F, boxShadow: chatLoading ? "none" : `0 4px 20px ${BL}44` }}>↑</button>
            </div>
          </div>
        )}

        {/* ══════ NUTRITION ══════ */}
        {tab === "nutrition" && (
          <div className="slide-up" style={{ padding: "18px 16px" }}>
            {/* Macro rings */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>🔥 احتياجاتك اليومية</div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
                {needs && [
                  { label: "سعرات", val: needs.calories, max: needs.calories, unit: "kcal", color: OR },
                  { label: "بروتين", val: needs.protein, max: needs.protein, unit: "g", color: BL },
                  { label: "كارب", val: needs.carbs, max: needs.carbs, unit: "g", color: GR },
                  { label: "دهون", val: needs.fat, max: needs.fat, unit: "g", color: PU },
                ].map(x => (
                  <Ring key={x.label} value={x.val} max={x.max} color={x.color} size={84}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: x.color, lineHeight: 1 }}>{x.val}</div>
                    <div style={{ fontSize: 9, color: MT, marginTop: 1 }}>{x.unit}</div>
                    <div style={{ fontSize: 9, color: MT2 }}>{x.label}</div>
                  </Ring>
                ))}
              </div>
            </div>

            {/* Water detail */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>💧 الماء المطلوب</div>
                <div style={{ fontSize: 14, color: CY, fontWeight: 800 }}>{needs?.waterMl}ml / يوم</div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, background: CARD2, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: CY }}>{profile?.weight ? Math.round(parseFloat(profile.weight) * 40) : 0}</div>
                  <div style={{ fontSize: 10, color: MT }}>ml أساسي</div>
                </div>
                <div style={{ flex: 1, background: CARD2, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: BL }}>+500</div>
                  <div style={{ fontSize: 10, color: MT }}>ml للكرياتين</div>
                </div>
                <div style={{ flex: 1, background: CARD2, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: OR }}>= {needs?.waterMl}</div>
                  <div style={{ fontSize: 10, color: MT }}>ml الإجمالي</div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "#050f1a", border: `1px solid ${CY}22` }}>
                <div style={{ fontSize: 12, color: CY, fontWeight: 600, marginBottom: 5 }}>⚠️ مهم جداً مع الكرياتين</div>
                <div style={{ fontSize: 12, color: MT, lineHeight: 1.7 }}>الكرياتين بيسحب الميه للعضلات — لو ما شربتش كفاية ممكن تاخد كرامب أو صداع.</div>
              </div>
            </div>

            {/* Micros */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔬 معادن وفيتامينات أساسية</div>
              {[
                { name: "زنك", need: "25-30mg", source: "لحمة حمراء، بذور اليقطين، كاجو، كبدة", icon: "🌿", color: GR },
                { name: "فيتامين D", need: "600-800 IU", source: "شمس يومياً + سمك + بيض", icon: "☀️", color: OR },
                { name: "حديد", need: "8-11mg", source: "لحمة حمراء، عدس، سبانخ", icon: "🩸", color: RO },
                { name: "مغنيسيوم", need: "400mg", source: "موز، مكسرات، حبوب كاملة", icon: "🍌", color: PU },
                { name: "فيتامين B12", need: "2.4μg", source: "لحمة، بيض، لبن", icon: "🥛", color: BL },
                { name: "كالسيوم", need: "1000mg", source: "لبن، زبادي، جبنة، بقول", icon: "🦴", color: MT2 },
              ].map((m, i, arr) => (
                <div key={m.name} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${BD}` : "none" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                      <span style={{ fontSize: 12, color: m.color, fontWeight: 700 }}>{m.need}</span>
                    </div>
                    <div style={{ fontSize: 11, color: MT, marginTop: 3, lineHeight: 1.5 }}>📍 {m.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ WORKOUT ══════ */}
        {tab === "workout" && (
          <div className="slide-up" style={{ padding: "18px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>🏋️ التمارين</div>
              <button className="tap" onClick={() => setShowWorkoutModal(true)}
                style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${BL}, ${CY})`, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: F, boxShadow: `0 4px 20px ${BL}44` }}>+ تمرين جديد</button>
            </div>

            {/* Streak */}
            <div style={{ background: streak.count > 0 ? "linear-gradient(135deg, #1c0f04, #2a1808)" : CARD, borderRadius: 20, border: `1px solid ${streak.count > 0 ? OR + "44" : BD}`, padding: "20px 22px", marginBottom: 14, display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontSize: 56 }}>🔥</div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 900, color: OR, lineHeight: 1 }}>{streak.count}</div>
                <div style={{ fontSize: 14, color: TX, fontWeight: 600, marginTop: 2 }}>يوم متتالي</div>
                <div style={{ fontSize: 12, color: MT, marginTop: 4 }}>
                  {streak.count === 0 ? "ابدأ سلسلتك النهارده! 💪" : streak.count >= 30 ? "أنت وحش! شهر كامل 🏆" : streak.count >= 14 ? "أسبوعين! مستمر 🔥" : streak.count >= 7 ? "أسبوع كامل، كمّل! ⚡" : "ما تكسرش السلسلة! 🔥"}
                </div>
              </div>
            </div>

            {/* Weekly plan */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: MT2 }}>📅 جدول الأسبوع (مبتدئ)</div>
              {[
                { day: "الأحد", muscles: "صدر + ترايسبس", emoji: "💪", color: BL },
                { day: "الإثنين", muscles: "ظهر + بايسبس", emoji: "🦾", color: GR },
                { day: "الثلاثاء", muscles: "راحة أو كارديو خفيف", emoji: "🧘", color: MT },
                { day: "الأربعاء", muscles: "كتف + رقبة", emoji: "🏋️", color: PU },
                { day: "الخميس", muscles: "أرجل كاملة (سكوات + ليج بريس)", emoji: "🦵", color: OR },
                { day: "الجمعة", muscles: "Full Body أو راحة", emoji: "⚡", color: CY },
                { day: "السبت", muscles: "راحة كاملة — ضروري للنمو!", emoji: "💤", color: MT },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i < 6 ? `1px solid ${BD}` : "none" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{d.emoji}</span>
                  <div style={{ minWidth: 72, fontSize: 12, fontWeight: 700, color: TX }}>{d.day}</div>
                  <div style={{ fontSize: 12, color: MT, flex: 1 }}>{d.muscles}</div>
                </div>
              ))}
            </div>

            {log.workouts?.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: GR }}>✅ تمارين النهارده</div>
                {log.workouts.map((w, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: 12, background: CARD2, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: GR, fontSize: 14 }}>{w.type}</div>
                      {w.muscles?.length > 0 && <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>{w.muscles.join(", ")}</div>}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ color: BL, fontWeight: 800, fontSize: 15 }}>{w.duration}د</div>
                      <div style={{ fontSize: 10, color: MT }}>{w.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ CARE TAB ══════ */}
        {tab === "care" && (
          <div className="slide-up" style={{ padding: "18px 16px" }}>

            {/* Header card */}
            <div style={{ background: "linear-gradient(135deg, #150820, #0e1420)", borderRadius: 20, border: `1px solid ${PU}33`, padding: "22px 20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, background: PU, borderRadius: "50%", filter: "blur(80px)", opacity: 0.08 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🪒</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>روتين العناية بالدقن</div>
                  <div style={{ fontSize: 12, color: MT, marginTop: 4 }}>بروتوكول Beardo — قبل النوم يومياً</div>
                </div>
                <div style={{ textAlign: "center", background: PU + "15", border: `1px solid ${PU}33`, borderRadius: 14, padding: "12px 16px" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: PU }}>{groomStreak.count}</div>
                  <div style={{ fontSize: 9, color: MT }}>يوم متتالي 🔥</div>
                </div>
              </div>
              {/* Week derma tracker */}
              <div style={{ marginTop: 16, padding: "14px 16px", background: "#0b0f1a", borderRadius: 14, border: `1px solid ${BD}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: MT2, fontWeight: 600 }}>🎯 ديرما رولر هذا الأسبوع</div>
                  <div style={{ fontSize: 12, color: dermaUsedThisWeek >= 2 ? RO : PU, fontWeight: 700 }}>{dermaUsedThisWeek} / 2 مرات</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1].map(i => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < dermaUsedThisWeek ? PU : "#1a2535", transition: "background .3s" }} />
                  ))}
                  <div style={{ flex: 3, height: 8, borderRadius: 4, background: "#1a2535" }} />
                </div>
                <div style={{ fontSize: 11, color: MT, marginTop: 8 }}>
                  {dermaUsedThisWeek >= 2 ? "⚠️ وصلت الحد الأسبوعي — استنى الأسبوع الجاي!" : `باقي ${2 - dermaUsedThisWeek} مرة تانية الأسبوع ده`}
                </div>
              </div>
            </div>

            {/* Today checklist */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>📋 روتين الليل النهارده</div>
                <div style={{ fontSize: 12, color: groomDoneCount >= groomTotal ? GR : MT, fontWeight: 700 }}>
                  {groomDoneCount}/{groomTotal} {groomDoneCount >= groomTotal ? "✅" : ""}
                </div>
              </div>

              {groomingSteps.map((step, idx) => {
                const done = !!groomLog[step.key];
                const isDisabled = step.disabled;
                return (
                  <div key={step.key} style={{ marginBottom: idx < groomingSteps.length - 1 ? 10 : 0 }}>
                    <button className={isDisabled ? "" : "tap"} onClick={() => !isDisabled && toggleGroomStep(step.key)}
                      style={{
                        width: "100%", textAlign: "right", padding: "16px 18px", borderRadius: 16,
                        border: `1.5px solid ${done ? step.color + "55" : isDisabled ? BD + "44" : BD}`,
                        background: done ? step.color + "0d" : isDisabled ? "#080c12" : CARD2,
                        cursor: isDisabled ? "not-allowed" : "pointer", fontFamily: F,
                        opacity: isDisabled ? 0.5 : 1, transition: "all .2s",
                      }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: done ? step.color + "20" : "#0d1525", border: `1px solid ${done ? step.color + "44" : BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          {step.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, color: done ? step.color : TX, fontSize: 14 }}>{step.label}</div>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${done ? step.color : BD}`, background: done ? step.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", transition: "all .25s", flexShrink: 0 }}>
                              {done ? "✓" : ""}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: MT, marginTop: 4, lineHeight: 1.6 }}>{step.desc}</div>
                          {step.tip && <div style={{ fontSize: 11, color: step.color, marginTop: 6, fontWeight: 600 }}>{step.tip}</div>}
                          {step.optional && !isDisabled && !done && (
                            <div style={{ display: "inline-block", marginTop: 6, padding: "3px 10px", borderRadius: 8, background: PU + "15", border: `1px solid ${PU}33`, fontSize: 10, color: PU }}>اختياري</div>
                          )}
                        </div>
                      </div>
                    </button>
                    {/* Arrow between steps */}
                    {idx < groomingSteps.length - 1 && (
                      <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                        <div style={{ width: 2, height: 12, background: BD, borderRadius: 1 }} />
                      </div>
                    )}
                  </div>
                );
              })}

              {groomDoneCount >= groomTotal && (
                <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 14, background: GR + "0d", border: `1px solid ${GR}33`, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                  <div style={{ fontWeight: 800, color: GR, fontSize: 15 }}>عملت الروتين النهارده!</div>
                  <div style={{ fontSize: 12, color: MT, marginTop: 4 }}>الاستمرارية هي السر — كل يوم بتعمله بيقرّبك من نتيجة أحسن 💪</div>
                </div>
              )}
            </div>

            {/* Protocol guide */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📖 بروتوكول الاستخدام الصح</div>

              {[
                {
                  step: "1", icon: "🧼", title: "غسيل الوجه أولاً",
                  points: ["استخدم غسول Beardo بالماء الفاتر", "دلّك وجهك بلطف لمدة 60 ثانية", "اشطفه بالماء البارد ونشّف بمنشفة نظيفة", "لازم الوجه يبقى جاف تماماً قبل الديرما"],
                  color: CY,
                },
                {
                  step: "2", icon: "🎯", title: "الديرما رولر (مرتين فقط في الأسبوع)",
                  points: ["عقّم الرولر بالكحول أو ماء نظيف قبل الاستخدام", "استنى ينشف كويس (دقيقتين)", "مشّيه أفقياً 10 مرات في كل اتجاه", "مشّيه رأسياً 10 مرات في كل اتجاه", "مشّيه قطرياً 10 مرات في كل اتجاه", "براحة خالص — مفيش ضغط زيادة", "الجلد هيحمرّ شوية — ده طبيعي جداً"],
                  color: PU,
                  warning: "⚠️ مرتين في الأسبوع بس — أكتر من كده ممكن يضر البشرة!",
                },
                {
                  step: "3", icon: "⏱️", title: "انتظر 10 دقائق",
                  points: ["بعد الديرما، استنى 10 دقايق قبل ما تحط الزيت", "في الأيام اللي ما استخدمتش الديرما فيها: حط الزيت فوراً"],
                  color: OR,
                },
                {
                  step: "4", icon: "💧", title: "زيت اللحية Beardo (يومياً)",
                  points: ["3 لـ 4 نقط بس على راحة إيدك", "دلّك على منطقة الذقن بحركات دائرية", "استمر لحد ما البشرة تمتص الزيت", "لو حطيته بعد الديرما: اغسله بعد 3 ساعات أو الصبح", "لو بدون ديرما: ممكن تسيبه الليلة كلها"],
                  color: OR,
                },
              ].map((section, si) => (
                <div key={si} style={{ marginBottom: si < 3 ? 16 : 0 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: section.color + "20", border: `1px solid ${section.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {section.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: section.color }}>الخطوة {section.step}: {section.title}</div>
                    </div>
                  </div>
                  <div style={{ paddingRight: 12, borderRight: `2px solid ${section.color}33` }}>
                    {section.points.map((pt, pi) => (
                      <div key={pi} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ color: section.color, fontSize: 11, marginTop: 2, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 12, color: MT2, lineHeight: 1.6 }}>{pt}</span>
                      </div>
                    ))}
                    {section.warning && (
                      <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 10, background: RO + "0d", border: `1px solid ${RO}33` }}>
                        <span style={{ fontSize: 11, color: RO }}>{section.warning}</span>
                      </div>
                    )}
                  </div>
                  {si < 3 && <div style={{ height: 1, background: BD, marginTop: 16 }} />}
                </div>
              ))}
            </div>

            {/* Expected timeline */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📅 جدول النتائج المتوقعة</div>
              {[
                { period: "الأسبوع 1-2", desc: "تحفيز بصيلات الشعر والدورة الدموية، البشرة هتتحسن", color: CY, icon: "🌱" },
                { period: "الأسبوع 3-4", desc: "ممكن تبدأ تشوف شعيرات جديدة خفيفة في بعض الأماكن", color: GR, icon: "🌿" },
                { period: "الشهر 2-3", desc: "نمو واضح أكتر وتكثّف في المناطق الفارغة", color: OR, icon: "🌳" },
                { period: "الشهر 4-6", desc: "النتيجة الكاملة — الاستمرارية هي المفتاح!", color: PU, icon: "🏆" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${BD}` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.color + "15", border: `1px solid ${t.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.color }}>{t.period}</div>
                    <div style={{ fontSize: 12, color: MT, marginTop: 3, lineHeight: 1.6 }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🛍️ منتجاتك Beardo</div>
              {[
                { name: "غسول الوجه", usage: "يومياً — قبل الروتين", icon: "🧴", color: CY, freq: "كل يوم" },
                { name: "ديرما رولر 540 إبرة", usage: "مرتين فقط في الأسبوع", icon: "🎯", color: PU, freq: "2× أسبوعياً" },
                { name: "زيت اللحية 30ml", usage: "يومياً بالليل (3-4 نقط)", icon: "💧", color: OR, freq: "كل يوم" },
              ].map((p, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${BD}` : "none" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: p.color + "15", border: `1px solid ${p.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: MT, marginTop: 3 }}>{p.usage}</div>
                  </div>
                  <div style={{ padding: "5px 12px", borderRadius: 8, background: p.color + "15", border: `1px solid ${p.color}33`, fontSize: 11, color: p.color, fontWeight: 700, whiteSpace: "nowrap" }}>{p.freq}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD + "f8", backdropFilter: "blur(20px)", borderTop: `1px solid ${BD}`, display: "flex", zIndex: 100 }}>
        {tabs.map(t => (
          <button key={t.id} className="tap" onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20, filter: tab === t.id ? "none" : "grayscale(80%) opacity(60%)", transition: "filter .2s" }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab === t.id ? 800 : 400, color: tab === t.id ? (t.id === "care" ? PU : BL) : MT, transition: "color .2s" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.id === "care" ? PU : BL, marginTop: -2 }} />}
          </button>
        ))}
      </div>

      {/* ── WORKOUT MODAL */}
      {showWorkoutModal && (
        <div className="fade-in" style={{ position: "fixed", inset: 0, background: "#000000d0", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={e => e.target === e.currentTarget && setShowWorkoutModal(false)}>
          <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: "#0b1120", borderRadius: "28px 28px 0 0", padding: "28px 24px 32px", border: `1px solid ${BD}`, borderBottom: "none" }}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: BD, margin: "0 auto 24px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>🏋️ تمرين جديد</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: MT, marginBottom: 8 }}>نوع التمرين</div>
              <select value={workoutForm.type} onChange={e => setWorkoutForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1px solid ${BD}`, background: CARD2, color: TX, fontSize: 14, fontFamily: F }}>
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
              <div style={{ fontSize: 12, color: MT, marginBottom: 8 }}>المدة بالدقائق</div>
              <input type="number" placeholder="مثلاً: 45" value={workoutForm.duration}
                onChange={e => setWorkoutForm(p => ({ ...p, duration: e.target.value }))}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1px solid ${BD}`, background: CARD2, color: TX, fontSize: 15, fontFamily: F, fontWeight: 700 }} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, color: MT, marginBottom: 10 }}>العضلات المستهدفة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["صدر", "ظهر", "أرجل", "كتف", "بايسبس", "ترايسبس", "بطن", "سمانة"].map(m => {
                  const sel = workoutForm.muscles?.includes(m);
                  return (
                    <button key={m} className="tap" onClick={() => setWorkoutForm(p => ({ ...p, muscles: sel ? p.muscles.filter(x => x !== m) : [...(p.muscles || []), m] }))}
                      style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${sel ? BL : BD}`, background: sel ? BL + "22" : "transparent", color: sel ? BL : MT2, fontSize: 13, cursor: "pointer", fontFamily: F, transition: "all .15s" }}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="tap" onClick={addWorkout}
                style={{ flex: 1, padding: "16px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${BL}, ${CY})`, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16, fontFamily: F, boxShadow: `0 6px 24px ${BL}44` }}>
                ✅ سجّل التمرين
              </button>
              <button className="tap" onClick={() => setShowWorkoutModal(false)}
                style={{ padding: "16px 22px", borderRadius: 16, border: `1px solid ${BD}`, background: "transparent", color: MT, cursor: "pointer", fontSize: 15, fontFamily: F }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
