import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { createCheckoutSession } from '../../shared/paymongo.ts';

const BUNDLES = {
  single: { name: "Single Strip", strips: 1, price: 49 },
  mini: { name: "Mini Bundle", strips: 4, price: 149 },
  classic: { name: "Classic Bundle", strips: 8, price: 249 },
  memory: { name: "Memory Bundle", strips: 12, price: 329 },
  keepsake: { name: "Keepsake Bundle", strips: 20, price: 499 },
  collector: { name: "Collector Bundle", strips: 30, price: 699 },
};
const FREE_SHIP_THRESHOLD = 999;
// J&T Express parcel rates (package under 1kg → 0–500g bracket) by destination zone.
const JT_ZONE_RATES = { manila: 95, luzon: 85, visayas: 100, mindanao: 105, island: 115 };
const ZONE_BY_REGION_CODE = {
  "130000000": "manila", "140000000": "luzon", "010000000": "luzon", "020000000": "luzon",
  "030000000": "luzon", "040000000": "luzon", "050000000": "luzon", "170000000": "luzon",
  "060000000": "visayas", "070000000": "visayas", "080000000": "visayas",
  "090000000": "mindanao", "100000000": "mindanao", "110000000": "mindanao",
  "120000000": "mindanao", "160000000": "mindanao", "150000000": "mindanao",
};
const zoneForRegion = (code) => ZONE_BY_REGION_CODE[code] || "island";
const computeShipping = (regionCode, subtotal) => {
  if (!regionCode) return JT_ZONE_RATES.island;
  if (subtotal >= FREE_SHIP_THRESHOLD) return 0;
  return JT_ZONE_RATES[zoneForRegion(regionCode)];
};
const PMT = ["card", "gcash", "paymaya"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { origin, strip_ids, bundle, paper, quantity,
      ship_full_name, ship_phone, ship_region, ship_region_code, ship_province, ship_city, ship_barangay, ship_street, ship_postal
    } = body;
    const b = BUNDLES[bundle];
    if (!b) return Response.json({ error: "Invalid bundle" }, { status: 400 });
    if (!Array.isArray(strip_ids) || strip_ids.length === 0) return Response.json({ error: "Select at least one strip" }, { status: 400 });
    if (strip_ids.length > b.strips) return Response.json({ error: "Too many strips for this bundle" }, { status: 400 });

    const ship = {
      ship_full_name: String(ship_full_name || "").trim(),
      ship_phone: String(ship_phone || "").trim(),
      ship_region: String(ship_region || "").trim(),
      ship_province: String(ship_province || "").trim(),
      ship_city: String(ship_city || "").trim(),
      ship_barangay: String(ship_barangay || "").trim(),
      ship_street: String(ship_street || "").trim(),
      ship_postal: String(ship_postal || "").trim(),
    };
    if (!ship.ship_full_name || !ship.ship_phone || !ship.ship_region || !String(ship_region_code || "").trim() || !ship.ship_province || !ship.ship_city || !ship.ship_barangay || !ship.ship_street)
      return Response.json({ error: "Shipping address required" }, { status: 400 });

    const shipping_address = [ship.ship_full_name, ship.ship_phone, ship.ship_street, ship.ship_barangay, ship.ship_city, ship.ship_province, ship.ship_region, ship.ship_postal].filter(Boolean).join(", ");

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const subtotal = b.price * qty;
    const shipCost = computeShipping(String(ship_region_code || "").trim(), subtotal);
    const total = subtotal + shipCost;

    const order = await base44.entities.Order.create({
      user_id: user.id,
      strip_ids,
      bundle_type: bundle,
      paper_type: ["matte", "glossy"].includes(paper) ? paper : "matte",
      quantity_required: b.strips * qty,
      quantity_selected: strip_ids.length,
      shipping_address,
      ...ship,
      shipping_cost: shipCost,
      shipping_method: "jt_live",
      subtotal,
      total,
      payment_status: "pending",
      fulfillment_status: "processing",
    });

    const secretKey = Deno.env.get("PAYMONGO_SECRET_KEY");
    const session = await createCheckoutSession({
      secretKey,
      lineItems: [{ name: `${b.name} — Print Club`, amount: Math.round(total * 100), currency: "PHP", quantity: 1 }],
      paymentMethodTypes: PMT,
      successUrl: `${origin}/print-shop?success=1`,
      cancelUrl: `${origin}/print-shop?canceled=1`,
      description: `${b.name} — Print Club`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    await base44.entities.Order.update(order.id, { paymongo_payment_id: session.id });

    return Response.json({ url: session.attributes.checkout_url, order_id: order.id });
  } catch (error) {
    console.error("createPrintCheckout error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});