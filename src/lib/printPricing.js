export const BUNDLES = [
  { id: "single", name: "Single Strip", strips: 1, price: 49 },
  { id: "mini", name: "Mini Bundle", strips: 4, price: 149 },
  { id: "classic", name: "Classic Bundle", strips: 8, price: 249 },
  { id: "memory", name: "Memory Bundle", strips: 12, price: 329 },
  { id: "keepsake", name: "Keepsake Bundle", strips: 20, price: 499 },
  { id: "collector", name: "Collector Bundle", strips: 30, price: 699 },
];

export const FREE_SHIP_THRESHOLD = 999;

// J&T Express parcel rates (package under 1kg → 0–500g weight bracket) by destination zone.
export const JT_ZONE_RATES = { manila: 95, luzon: 85, visayas: 100, mindanao: 105, island: 115 };

// PSGC region code → J&T destination zone.
export const ZONE_BY_REGION_CODE = {
  "130000000": "manila",   // NCR
  "140000000": "luzon",    // CAR
  "010000000": "luzon",    // Ilocos Region
  "020000000": "luzon",    // Cagayan Valley
  "030000000": "luzon",    // Central Luzon
  "040000000": "luzon",    // CALABARZON
  "050000000": "luzon",    // Bicol Region
  "170000000": "luzon",    // MIMAROPA Region
  "060000000": "visayas",  // Western Visayas
  "070000000": "visayas",  // Central Visayas
  "080000000": "visayas",  // Eastern Visayas
  "090000000": "mindanao", // Zamboanga Peninsula
  "100000000": "mindanao", // Northern Mindanao
  "110000000": "mindanao", // Davao Region
  "120000000": "mindanao", // SOCCSKSARGEN
  "160000000": "mindanao", // Caraga
  "150000000": "mindanao", // BARMM
};

export const zoneForRegion = (code) => ZONE_BY_REGION_CODE[code] || "island";

export const formatPrice = (n) => `₱${Math.round(n || 0).toLocaleString("en-PH")}`;

export const computeShipping = (regionCode, subtotal) => {
  if (!regionCode) return null;
  if (subtotal >= FREE_SHIP_THRESHOLD) return 0;
  return JT_ZONE_RATES[zoneForRegion(regionCode)];
};

export const computeTotal = (bundleId, qty, regionCode) => {
  const b = BUNDLES.find((x) => x.id === bundleId);
  const quantity = Math.max(1, Number(qty) || 1);
  const subtotal = (b?.price || 0) * quantity;
  const shipping = computeShipping(regionCode, subtotal);
  return { subtotal, shipping, total: subtotal + (shipping || 0) };
};