import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { getBundle, calcShipping } from "../../shared/print.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bundleId, paperType, stripIds, address, zone, orderId, userId } = body;
    const bundle = getBundle(bundleId);
    if (!bundle) return Response.json({ error: "Invalid bundle" }, { status: 400 });
    if (!Array.isArray(stripIds) || stripIds.length !== bundle.strips) {
      return Response.json({ error: `Select exactly ${bundle.strips} strips` }, { status: 400 });
    }

    const subtotal = bundle.price;
    const ship = calcShipping(zone, subtotal);
    const total = subtotal + ship.cost;
    const isIntl = zone === "international";
    const origin = req.headers.get("origin") || "https://app.base44.com";

    const orderData = {
      user_id: userId || "",
      bundle_type: bundle.id,
      paper_type: paperType,
      strip_ids: stripIds,
      quantity_required: bundle.strips,
      quantity_selected: stripIds.length,
      shipping_address: JSON.stringify(address || {}),
      shipping_cost: ship.cost,
      shipping_method: ship.method,
      subtotal,
      total,
      payment_status: "processing",
      fulfillment_status: "processing",
    };

    let order;
    if (orderId) {
      order = await base44.entities.Order.update(orderId, orderData);
    } else {
      order = await base44.entities.Order.create(orderData);
    }

    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) {
      console.error("create-print-checkout: STRIPE_SECRET_KEY missing");
      return Response.json({ error: "Stripe is not configured.", orderId: order.id }, { status: 503 });
    }

    const pmTypes = ["card"];
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("currency", "php");
    params.set("success_url", `${origin}/print-shop?paid=true&order=${order.id}&session={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/print-shop?canceled=true&order=${order.id}`);
    params.set("client_reference_id", order.id);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "php");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(total * 100)));
    params.set("line_items[0][price_data][product_data][name]", `${bundle.id} Print Bundle`);
    for (const t of pmTypes) params.append("payment_method_types[]", t);

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const session = await sessionRes.json();
    if (!session.url) {
      console.error("create-print-checkout: stripe session error", session);
      return Response.json({ error: session.error?.message || "Stripe session failed", orderId: order.id }, { status: 502 });
    }
    return Response.json({ url: session.url, orderId: order.id });
  } catch (error) {
    console.error("create-print-checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});