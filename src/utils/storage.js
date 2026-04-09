export async function storeGet(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch (e) {
    console.warn("Storage Get Error:", e);
    return null;
  }
}

export async function storeSet(key, val) {
  try {
    await window.storage.set(key, JSON.stringify(val));
  } catch (e) {
    console.warn("Storage Set Error:", e);
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
