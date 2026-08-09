// Detects the user's country (ISO code, e.g. "PH") via IP geolocation, so
// pricing can be shown in the right currency. Cached for the session since
// a user's country won't change mid-visit, and to avoid repeat lookups.
let cached = null;

export async function getUserCountry() {
  if (cached) return cached;
  const stored = sessionStorage.getItem("vendi_country");
  if (stored) {
    cached = stored;
    return stored;
  }
  try {
    const res = await fetch("https://ipapi.co/country/");
    const code = (await res.text()).trim();
    cached = /^[A-Z]{2}$/.test(code) ? code : "";
  } catch (_e) {
    cached = "";
  }
  sessionStorage.setItem("vendi_country", cached);
  return cached;
}