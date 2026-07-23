export const BUNDLES = [
  { id: "mini", name: "Mini Pack", maxStrips: 1, price: 12 },
  { id: "trio", name: "Trio Pack", maxStrips: 3, price: 30 },
  { id: "set", name: "Collector Set", maxStrips: 6, price: 54 },
];

export const SHIPPING = {
  jt_live: { label: "J&T Express", price: 6 },
  zone_fallback: { label: "Zone Fallback", price: 9 },
};

export const formatPrice = (n) => `$${(n || 0).toFixed(2)}`;

export const computeTotal = (bundleId, qty, shipMethod) => {
  const b = BUNDLES.find((x) => x.id === bundleId);
  const quantity = Math.max(1, Number(qty) || 1);
  const subtotal = (b?.price || 0) * quantity;
  const shipping = SHIPPING[shipMethod]?.price || 0;
  return { subtotal, shipping, total: subtotal + shipping };
};