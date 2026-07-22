import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, sessionId, userId } = await req.json();
    if (!orderId || !sessionId) return Response.json({ error: "Missing order or session" }, { status: 400 });

    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) {
      console.error("confirm-print-payment: STRIPE_SECRET_KEY missing");
      return Response.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const order = await base44.entities.Order.get(orderId);
    if (!order) return Response.json({ error: "Order not found", ok: false }, { status: 404 });

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const session = await res.json();

    if (session.payment_status === "paid") {
      const retainUntil = new Date(Date.now() + 30 * 86400000).toISOString();
      await base44.entities.Order.update(orderId, {
        payment_status: "paid",
        paymongo_payment_id: session.payment_intent || sessionId,
        retain_until: retainUntil,
      });
      await base44.entities.BillingRecord.create({
        user_id: userId || "",
        type: "print_order",
        amount: order.total,
        status: "paid",
        paymongo_transaction_id: session.payment_intent || sessionId,
        created_at: new Date().toISOString(),
      });
      await base44.entities.Notification.create({
        user_id: userId || "",
        type: "order_update",
        message: `Your ${order.bundle_type} print order is confirmed!`,
        link: "/orders",
        read: false,
        created_at: new Date().toISOString(),
      });
      return Response.json({ ok: true, orderId });
    }

    await base44.entities.Order.update(orderId, { payment_status: "failed" });
    return Response.json({ ok: false, orderId, reason: "Payment not completed" });
  } catch (error) {
    console.error("confirm-print-payment error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});