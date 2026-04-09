import { create } from 'zustand';
import { storeGet, storeSet, getTODAY, getWeekStart } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const useStore = create((set, get) => ({
  profile: null,
  log: { waterMl: 0, supplements: {}, workouts: [] },
  streak: { count: 0, lastDate: null },
  groomStreak: { count: 0, lastDate: null },
  messages: [],
  groomLog: { facewash: false, dermaRoller: false, oil: false, oilTime: null },
  dermaWeekDays: [],
  weights: [],
  measurements: [],
  prs: {},
  badges: [],
  lastCheckin: null,
  needsAIReview: false,
  hydrated: false,

  hydrate: async () => {
    const today = getTODAY();
    const weekStart = getWeekStart();

    const profile = await storeGet(STORAGE_KEYS.profile);
    const log = await storeGet(`${STORAGE_KEYS.logs}:${today}`) || { waterMl: 0, supplements: {}, workouts: [] };
    const streak = await storeGet(STORAGE_KEYS.streak) || { count: 0, lastDate: null };
    const groomStreak = await storeGet(STORAGE_KEYS.groomStreak) || { count: 0, lastDate: null };
    const chat = await storeGet(STORAGE_KEYS.chat) || [];
    const groomLog = await storeGet(`${STORAGE_KEYS.groom}:${today}`) || { facewash: false, dermaRoller: false, oil: false, oilTime: null };
    const dermaWeekDays = await storeGet(`${STORAGE_KEYS.dermaWeek}:${weekStart}`) || [];
    const weights = await storeGet(STORAGE_KEYS.weights) || [];
    const measurements = await storeGet(STORAGE_KEYS.measurements) || [];
    const prs = await storeGet(STORAGE_KEYS.prs) || {};
    const badges = await storeGet(STORAGE_KEYS.badges) || [];
    const lastCheckin = await storeGet("fd:lastCheckin");
    const needsAIReview = await storeGet("fd:needsAIReview") || false;

    set({ 
      profile, log, streak, groomStreak, 
      messages: chat.length ? chat : [{ role: "assistant", content: "Dodo! 💪\nأنا مدربك الشخصي AI — بعرف كل حاجة عن نظامك الغذائي، تمارينك، مكملاتك، وروتين العناية بالدقن!\n\nقولي اتمرنت أو أكلت إيه النهارده، أو سألني عن روتين الديرما رولر والزيت — وأنا هساعدك في كل حاجة! 🔥" }], 
      groomLog, dermaWeekDays, weights, measurements, prs, badges, lastCheckin, needsAIReview,
      hydrated: true 
    });
  },

  setProfile: async (profile) => {
    set({ profile });
    await storeSet(STORAGE_KEYS.profile, profile);
  },

  setLog: async (newLog) => {
    const today = getTODAY();
    set({ log: newLog });
    await storeSet(`${STORAGE_KEYS.logs}:${today}`, newLog);
  },

  addWater: async (ml, target) => {
    const { log, setLog } = get();
    const nw = Math.min((log.waterMl || 0) + ml, target || 4000);
    await setLog({ ...log, waterMl: nw });
  },

  toggleSupp: async (key) => {
    const { log, setLog } = get();
    const ns = { ...log.supplements, [key]: !log.supplements?.[key] };
    await setLog({ ...log, supplements: ns });
  },

  addWorkout: async (workout) => {
    const { log, setLog, updateStreak } = get();
    const workouts = [...(log.workouts || []), { ...workout, date: getTODAY(), time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) }];
    await setLog({ ...log, workouts });
    await updateStreak("fitness");
  },

  setGroomLog: async (newGroomLog) => {
    const today = getTODAY();
    set({ groomLog: newGroomLog });
    await storeSet(`${STORAGE_KEYS.groom}:${today}`, newGroomLog);
    if (newGroomLog.oil) {
      await get().updateStreak("grooming");
    }
  },

  toggleGroomStep: async (key) => {
    const { groomLog, setGroomLog, dermaWeekDays } = get();
    const today = getTODAY();
    const updated = { ...groomLog, [key]: !groomLog[key] };
    
    if (key === "oil" && !groomLog.oil) {
      updated.oilTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    }
    
    if (key === "dermaRoller" && !groomLog.dermaRoller) {
      const weekStart = getWeekStart();
      const newWeek = [...(dermaWeekDays || []).filter(d => d !== today), today];
      set({ dermaWeekDays: newWeek });
      await storeSet(`${STORAGE_KEYS.dermaWeek}:${weekStart}`, newWeek);
    }
    
    await setGroomLog(updated);
  },

  updateStreak: async (type) => {
    const today = getTODAY();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    
    if (type === "fitness") {
      const { streak } = get();
      const newCount = streak.lastDate === yStr ? streak.count + 1 : (streak.lastDate === today ? streak.count : 1);
      const ns = { count: newCount, lastDate: today };
      set({ streak: ns });
      await storeSet(STORAGE_KEYS.streak, ns);
    } else {
      const { groomStreak } = get();
      const newCount = groomStreak.lastDate === yStr ? groomStreak.count + 1 : (groomStreak.lastDate === today ? groomStreak.count : 1);
      const ns = { count: newCount, lastDate: today };
      set({ groomStreak: ns });
      await storeSet(STORAGE_KEYS.groomStreak, ns);
    }
  },

  addMessage: async (msg) => {
    const { messages } = get();
    const updated = [...messages, msg];
    set({ messages: updated });
    await storeSet(STORAGE_KEYS.chat, updated.slice(-30));
  },

  addWeight: async (weight) => {
    const { weights } = get();
    const today = getTODAY();
    const updated = [...weights.filter(w => w.date !== today), { date: today, value: parseFloat(weight) }].slice(-14);
    set({ weights: updated });
    await storeSet(STORAGE_KEYS.weights, updated);
  },

  performCheckIn: async (weight, chest, arm, waist) => {
    const now = new Date().toISOString();
    const { profile, measurements } = get();
    const lastM = measurements[measurements.length - 1];
    
    const newEntry = { date: now, weight, chest, arm, waist };
    const delta = lastM ? weight - lastM.weight : 0;
    
    const newProfile = { ...profile, weight };
    const newMeasurements = [...measurements, newEntry];
    
    set({ 
      profile: newProfile, 
      measurements: newMeasurements, 
      lastCheckin: now, 
      needsAIReview: true,
      checkinDelta: delta
    });

    await storeSet(STORAGE_KEYS.profile, newProfile);
    await storeSet(STORAGE_KEYS.measurements, newMeasurements);
    await storeSet("fd:lastCheckin", now);
    await storeSet("fd:needsAIReview", true);
  },

  setAIReviewDone: async () => {
    set({ needsAIReview: false });
    await storeSet("fd:needsAIReview", false);
  },

  setPR: async (exercise, weight, reps) => {
    const { prs } = get();
    const updated = { ...prs, [exercise]: { weight, reps, date: getTODAY() } };
    set({ prs: updated });
    await storeSet(STORAGE_KEYS.prs, updated);
  },

  setSleep: async (hours) => {
    const { log, setLog } = get();
    await setLog({ ...log, sleepHours: hours });
  }
}));

export default useStore;
