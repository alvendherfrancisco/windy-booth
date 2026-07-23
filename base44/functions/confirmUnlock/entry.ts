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

    const type = session.metadata?.unlock_type;
    const category = session.metadata?.category || "";
    if (session.metadata?.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });

    if (type === "lifetime") {
      if (user.plan === "lifetime" || user.plan === "premium") return Response.json({ ok: true, type: "lifetime", already: true });
      await base44.auth.updateMe({ plan: "lifetime", plan_renewed_at: new Date().toISOString() });
    } else if (type === "collection") {
      const owned = user.owned_collections || [];
      if (owned.includes(category)) return Response.json({ ok: true, type: "collection", already: true, category });
      await base44.auth.updateMe({ owned_collections: [...owned, category] });
    } else {
      return Response.json({ error: "Invalid unlock type" }, { status: 400 });
    }

    await base44.entities.BillingRecord.create({
      user_id: user.id,
      type: type === "lifetime" ? "subscription" : "print_order",
      amount: (session.amount_total || 0) / 100,
      status: "paid",
      paymongo_transaction_id: session_id,
      created_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, type, category });
  } catch (error) {
    console.error("confirmUnlock error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});