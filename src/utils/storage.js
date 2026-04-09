export async function storeGet(key) {
  try {
    if (window.storage) {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : null;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function storeSet(key, value) {
  try {
    if (window.storage) {
      await window.storage.set(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
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
