import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@14.25.0';

const BUNDLES = {
  mini: { name: "Mini Pack", maxStrips: 1, price: 12 },
  trio: { name: "Trio Pack", maxStrips: 3, price: 30 },
  set: { name: "Collector Set", maxStrips: 6, price: 54 },
};
const SHIPPING = { jt_live: 6, zone_fallback: 9 };
const CURRENCY = "usd";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { origin, strip_ids, bundle, paper, quantity, address, shipping_method } = body;
    const b = BUNDLES[bundle];
    if (!b) return Response.json({ error: "Invalid bundle" }, { status: 400 });
    if (!Array.isArray(strip_ids) || strip_ids.length === 0) return Response.json({ error: "Select at least one strip" }, { status: 400 });
    if (strip_ids.length > b.maxStrips) return Response.json({ error: "Too many strips for this bundle" }, { status: 400 });
    if (!address || !String(address).trim()) return Response.json({ error: "Shipping address required" }, { status: 400 });

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const shipCost = SHIPPING[shipping_method] ?? 0;
    const subtotal = b.price * qty;
    const total = subtotal + shipCost;

    const order = await base44.entities.Order.create({
      user_id: user.id,
      strip_ids,
      bundle_type: bundle,
      paper_type: ["matte", "glossy"].includes(paper) ? paper : "matte",
      quantity_required: qty,
      quantity_selected: qty,
      shipping_address: String(address).trim(),
      shipping_cost: shipCost,
      shipping_method: SHIPPING[shipping_method] !== undefined ? shipping_method : "jt_live",
      subtotal,
      total,
      payment_status: "pending",
      fulfillment_status: "processing",
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(total * 100),
          product_data: { name: `${b.name} — Print Bundle` },
        },
      }],
      success_url: `${origin}/print-shop?success=1&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/print-shop?canceled=1`,
      metadata: {
        order_id: order.id,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    return Response.json({ url: session.url, order_id: order.id });
  } catch (error) {
    console.error("createPrintCheckout error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});