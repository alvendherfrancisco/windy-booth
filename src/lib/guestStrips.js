// Lightweight local storage of strips created before the user signs up.
// Only URLs/metadata are stored (files are already uploaded to app storage),
// so this stays tiny. Migrated into real Strip records once the user logs in.
const KEY = "vendi_guest_strips";
const MAX_GUEST_STRIPS = 10;

export function getGuestStrips() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(strips) {
  try { localStorage.setItem(KEY, JSON.stringify(strips)); } catch { /* storage unavailable */ }
}

export function addGuestStrip(strip) {
  const strips = getGuestStrips();
  const record = { id: `guest-${Date.now()}`, ...strip };
  save([record, ...strips].slice(0, MAX_GUEST_STRIPS));
  return record;
}

export function deleteGuestStrip(id) {
  save(getGuestStrips().filter((s) => s.id !== id));
}

export function clearGuestStrips() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}