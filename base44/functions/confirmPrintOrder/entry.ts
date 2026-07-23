import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { retrieveSession, isSessionPaid, paidAmount } from '../../shared/paymongo.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, order_id } = await req.json().catch(() => ({}));
    let sessionId = session_id;
    let orderId = order_id;

    // If no id was passed back (PayMongo does not append one), look up the
    // user's most recent pending print order and use its stored checkout id.
    if (!sessionId) {
      const orders = await base44.entities.Order.filter({ user_id: user.id, payment_status: "pending" }, "-created_date", 1);
      const pending = orders[0];
      if (!pending) return Response.json({ error: "No pending order" }, { status: 400 });
      sessionId = pending.paymongo_payment_id;
      orderId = pending.id;
    }
    if (!sessionId) return Response.json({ error: "Missing session id" }, { status: 400 });

    const secretKey = Deno.env.get("PAYMONGO_SECRET_KEY");
    const session = await retrieveSession(secretKey, sessionId);
    if (!isSessionPaid(session)) return Response.json({ ok: false });

    if (!orderId) orderId = session.attributes.metadata?.order_id;
    if (!orderId) return Response.json({ error: "No order in session" }, { status: 400 });

    const existing = await base44.entities.Order.get(orderId);
    if (!existing || existing.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (existing.payment_status === "paid") return Response.json({ ok: true, order_id: orderId, already: true });

    await base44.entities.Order.update(orderId, { payment_status: "paid" });
    await base44.entities.BillingRecord.create({
      user_id: user.id,
      type: "print_order",
      amount: paidAmount(session) || existing.total,
      status: "paid",
      paymongo_transaction_id: sessionId,
      created_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, order_id: orderId });
  } catch (error) {
    console.error("confirmPrintOrder error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});