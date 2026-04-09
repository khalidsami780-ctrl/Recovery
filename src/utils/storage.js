export async function storeGet(key) {
  try {
    const s = typeof window !== 'undefined' ? window.storage : null;
    const isArtifact = s && typeof s.get === 'function';

    if (isArtifact) {
      const r = await s.get(key);
      if (!r || !r.value) return null;
      try {
        return JSON.parse(r.value);
      } catch {
        return null;
      }
    }

    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  } catch (e) {
    console.warn("Storage Get Fail:", e);
    return null;
  }
}

export async function storeSet(key, value) {
  try {
    const s = typeof window !== 'undefined' ? window.storage : null;
    const isArtifact = s && typeof s.set === 'function';
    const safe = JSON.stringify(value ?? null);

    if (isArtifact) {
      await s.set(key, safe);
    } else {
      localStorage.setItem(key, safe);
    }
  } catch (e) {
    console.warn("Storage Set Fail:", e);
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
