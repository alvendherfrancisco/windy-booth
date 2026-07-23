import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: "Missing session id" }, { status: 400 });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") return Response.json({ ok: false, status: session.payment_status });

    const orderId = session.metadata?.order_id;
    if (!orderId) return Response.json({ error: "No order in session" }, { status: 400 });

    const existing = await base44.entities.Order.get(orderId);
    if (!existing || existing.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (existing.payment_status === "paid") return Response.json({ ok: true, order_id: orderId, already: true });

    await base44.entities.Order.update(orderId, { payment_status: "paid" });
    await base44.entities.BillingRecord.create({
      user_id: user.id,
      type: "print_order",
      amount: (session.amount_total || 0) / 100,
      status: "paid",
      paymongo_transaction_id: session_id,
      created_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, order_id: orderId });
  } catch (error) {
    console.error("confirmPrintOrder error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});