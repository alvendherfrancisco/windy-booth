// Stable per-browser identifier for guest session tracking. More reliable
// than IP (which can flicker across requests behind proxies/CDNs) — this
// stays constant across refreshes for the same browser.
const KEY = "vendi_device_id";

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}