export const BUNDLES = [
  { id: "Mini", price: 149, strips: 4, copies: 1 },
  { id: "Classic", price: 249, strips: 8, copies: 1 },
  { id: "Memory", price: 329, strips: 12, copies: 1 },
  { id: "Keepsake", price: 499, strips: 20, copies: 2 },
  { id: "Collector", price: 699, strips: 30, copies: 2 },
];

export function getBundle(id) {
  return BUNDLES.find((b) => b.id === id);
}

export const SHIPPING_ZONES = {
  metro: { label: "Metro Manila", rate: 60 },
  luzon: { label: "Luzon", rate: 95 },
  visayas: { label: "Visayas", rate: 130 },
  mindanao: { label: "Mindanao", rate: 150 },
  international: { label: "International", rate: 450 },
};

export const FREE_SHIPPING_THRESHOLD = 999;

export function calcShipping(zone, subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return { cost: 0, method: "zone_fallback", free: true };
  const z = SHIPPING_ZONES[zone] || SHIPPING_ZONES.luzon;
  return { cost: z.rate, method: "zone_fallback", free: false };
}