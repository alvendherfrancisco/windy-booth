import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { retrieveSession, isSessionPaid, paidAmount } from '../../shared/paymongo.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id } = await req.json().catch(() => ({}));
    const sessionId = session_id || user.pending_checkout_id;
    if (!sessionId) return Response.json({ error: "No pending checkout" }, { status: 400 });

    const secretKey = Deno.env.get("PAYMONGO_SECRET_KEY");
    const session = await retrieveSession(secretKey, sessionId);
    if (!isSessionPaid(session)) return Response.json({ ok: false });

    const meta = session.attributes.metadata || {};
    const type = meta.unlock_type || user.pending_unlock_type;
    const category = meta.category || user.pending_unlock_category || "";
    if (meta.user_id && meta.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });

    let already = false;
    if (type === "lifetime") {
      already = user.plan === "lifetime" || user.plan === "premium";
      if (!already) await base44.auth.updateMe({ plan: "lifetime", plan_renewed_at: new Date().toISOString() });
    } else if (type === "collection") {
      const owned = user.owned_collections || [];
      already = owned.includes(category);
      if (!already) await base44.auth.updateMe({ owned_collections: [...owned, category] });
    } else {
      return Response.json({ error: "Invalid unlock type" }, { status: 400 });
    }

    await base44.entities.BillingRecord.create({
      user_id: user.id,
      type: type === "lifetime" ? "subscription" : "print_order",
      amount: paidAmount(session),
      status: "paid",
      paymongo_transaction_id: sessionId,
      created_at: new Date().toISOString(),
    });

    // Clear the pending checkout marker.
    await base44.auth.updateMe({ pending_checkout_id: "", pending_unlock_type: "", pending_unlock_category: "" });

    return Response.json({ ok: true, type, category, already });
  } catch (error) {
    console.error("confirmUnlock error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});