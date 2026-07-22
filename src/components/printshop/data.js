export const BUNDLES = [
  { id: "Mini", price: 149, strips: 4, copies: 1, blurb: "A little keepsake set." },
  { id: "Classic", price: 249, strips: 8, copies: 1, blurb: "Our most popular bundle." },
  { id: "Memory", price: 329, strips: 12, copies: 1, blurb: "More memories, more room." },
  { id: "Keepsake", price: 499, strips: 20, copies: 2, blurb: "Double the prints to share." },
  { id: "Collector", price: 699, strips: 30, copies: 2, blurb: "The full collection, premium sleeve." },
];

export const getBundle = (id) => BUNDLES.find((b) => b.id === id);

export const includedItems = (b) => [
  `${b.strips} photo strips`,
  `${b.copies} printed cop${b.copies > 1 ? "ies" : "y"}`,
  "Matte or glossy finish",
];

export const SHIPPING_ZONES = {
  metro: { label: "Metro Manila", rate: 60 },
  luzon: { label: "Luzon", rate: 95 },
  visayas: { label: "Visayas", rate: 130 },
  mindanao: { label: "Mindanao", rate: 150 },
  international: { label: "International", rate: 450 },
};

export const FREE_SHIPPING_THRESHOLD = 999;

export function calcShippingLocal(zone, subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return { cost: 0, method: "zone_fallback", free: true };
  const z = SHIPPING_ZONES[zone] || SHIPPING_ZONES.luzon;
  return { cost: z.rate, method: "zone_fallback", free: false };
}