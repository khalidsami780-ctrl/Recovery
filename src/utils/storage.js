export async function storeGet(key) {
  try {
    // Check if we are in the Claude artifact environment
    const isArtifact = typeof window !== 'undefined' && 
                       window.storage && 
                       typeof window.storage.get === 'function';

    if (isArtifact) {
      const r = await window.storage.get(key);
      if (!r || !r.value) return null;
      try {
        return JSON.parse(r.value);
      } catch (e) {
        console.warn("Artifact JSON Parse Error:", e);
        return null;
      }
    }

    // Standard browser fallback
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("localStorage JSON Parse Error:", e);
      return null;
    }
  } catch (err) {
    console.error("storeGet Critical Fail:", err);
    return null;
  }
}

export async function storeSet(key, value) {
  try {
    const isArtifact = typeof window !== 'undefined' && 
                       window.storage && 
                       typeof window.storage.set === 'function';
    
    const safeValue = JSON.stringify(value ?? null);

    if (isArtifact) {
      await window.storage.set(key, safeValue);
    } else {
      localStorage.setItem(key, safeValue);
    }
  } catch (err) {
    console.error("storeSet Critical Fail:", err);
  }
}

export function getTODAY() {
  return new Date().toISOString().split("T")[0];
}

export function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

export function getArabicDate() {
  return new Date().toLocaleDateString("ar-EG", { weekday: "long", month: "long", day: "numeric" });
}
