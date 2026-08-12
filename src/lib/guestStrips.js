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

// `strip` is the full record already saved server-side (has a real id), so
// admins can see it too — this just keeps a local copy for display until
// the guest signs up and claims it.
export function addGuestStrip(strip) {
  const strips = getGuestStrips();
  save([strip, ...strips].slice(0, MAX_GUEST_STRIPS));
  return strip;
}

export function deleteGuestStrip(id) {
  save(getGuestStrips().filter((s) => s.id !== id));
}

export function clearGuestStrips() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}