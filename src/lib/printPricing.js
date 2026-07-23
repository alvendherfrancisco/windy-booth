export const BUNDLES = [
  { id: "single", name: "Single Strip", strips: 1, price: 49 },
  { id: "mini", name: "Mini Bundle", strips: 4, price: 149 },
  { id: "classic", name: "Classic Bundle", strips: 8, price: 249 },
  { id: "memory", name: "Memory Bundle", strips: 12, price: 329 },
  { id: "keepsake", name: "Keepsake Bundle", strips: 20, price: 499 },
  { id: "collector", name: "Collector Bundle", strips: 30, price: 699 },
];

export const FREE_SHIP_THRESHOLD = 999;
export const JT_RATES = { metro: 75, provincial: 120 };

export const PHILIPPINE_REGIONS = [
  "Metro Manila (NCR)",
  "Cordillera Administrative Region (CAR)",
  "Ilocos Region (Region I)",
  "Cagayan Valley (Region II)",
  "Central Luzon (Region III)",
  "CALABARZON (Region IV-A)",
  "MIMAROPA (Region IV-B)",
  "Bicol Region (Region V)",
  "Western Visayas (Region VI)",
  "Central Visayas (Region VII)",
  "Eastern Visayas (Region VIII)",
  "Zamboanga Peninsula (Region IX)",
  "Northern Mindanao (Region X)",
  "Davao Region (Region XI)",
  "SOCCSKSARGEN (Region XII)",
  "Caraga (Region XIII)",
  "Bangsamoro (BARMM)",
];

export const formatPrice = (n) => `₱${Math.round(n || 0).toLocaleString("en-PH")}`;

export const computeShipping = (region, subtotal) => {
  if (subtotal >= FREE_SHIP_THRESHOLD) return 0;
  const r = (region || "").toLowerCase();
  const isMetro = r.includes("metro manila") || r.includes("ncr") || r.includes("national capital");
  return isMetro ? JT_RATES.metro : JT_RATES.provincial;
};

export const computeTotal = (bundleId, qty, region) => {
  const b = BUNDLES.find((x) => x.id === bundleId);
  const quantity = Math.max(1, Number(qty) || 1);
  const subtotal = (b?.price || 0) * quantity;
  const shipping = computeShipping(region, subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
};