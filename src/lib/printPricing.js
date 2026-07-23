export const BUNDLES = [
  { id: "mini", name: "Mini Bundle", strips: 4, price: 149 },
  { id: "classic", name: "Classic Bundle", strips: 8, price: 249 },
  { id: "memory", name: "Memory Bundle", strips: 12, price: 329 },
  { id: "keepsake", name: "Keepsake Bundle", strips: 20, price: 499 },
  { id: "collector", name: "Collector Bundle", strips: 30, price: 699 },
];

export const FREE_SHIP_THRESHOLD = 999;
export const SHIP_FLAT = 80;

export const formatPrice = (n) => `₱${Math.round(n || 0).toLocaleString("en-PH")}`;

export const computeTotal = (bundleId, qty) => {
  const b = BUNDLES.find((x) => x.id === bundleId);
  const quantity = Math.max(1, Number(qty) || 1);
  const subtotal = (b?.price || 0) * quantity;
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
  return { subtotal, shipping, total: subtotal + shipping };
};