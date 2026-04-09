import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { getTODAY } from '../utils/storage';

export function useNotifications() {
  const { log, groomLog, profile } = useStore();
  const intervalRef = useRef(null);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "💪" });
    }
  };

  useEffect(() => {
    requestPermission();

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      // Only check on the hour
      if (m !== 0) return;

      // Daily Schedule
      if (h === 8) sendNotification("🌅 وقت الفطار!", "3 بيض + توست + لبن + موزة. متفوتوش!");
      else if (h === 11) sendNotification("🥜 سناك الصبح!", "مكسرات + موزة — حافظ على طاقتك!");
      else if (h === 14) sendNotification("🍗 وقت الغداء!", "صدر فراخ + أرز بني. أكبر وجبتك!");
      else if (h === 17) sendNotification("⚡ وقت التمرين!", "استعد! لو ده يوم تمرينك، اجهز دلوقتي.");
      else if (h === 19) sendNotification("💊 وقت المكملات!", "أخدت الكرياتين والزنك؟");
      else if (h === 22 && !groomLog.oil) sendNotification("🪒 روتين الليل!", "وقت روتين العناية بالدقن — غسيل + ديرما + زيت!");
      
      // Periodic water reminders
      else if (h % 2 === 0 && h >= 8 && h <= 22) {
        if (log.waterMl < (profile?.waterMl || 3000)) {
          sendNotification("💧 اشرب ميه!", "كوباية ميه دلوقتي — الكرياتين يحتاج ترطيب!");
        }
      }

      // Specific Workout reminder based on plan
      const day = now.getDay(); // 0=Sun, 1=Mon...
      const plan = [
        "صدر + ترايسبس", "ظهر + بايسبس", "راحة أو كارديو", 
        "كتف + رقبة", "أرجل كاملة", "Full Body", "راحة"
      ];
      if (h === 17 && plan[day] !== "راحة") {
        sendNotification("⚡ استعد للتمرين!", `النهارده تمرين ${plan[day]} — جهّز نفسك! 💪`);
      }

    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [log, groomLog, profile]);

  return { requestPermission };
}
