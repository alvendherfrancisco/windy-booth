import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { createCheckoutSession } from '../../shared/paymongo.ts';

// One-time unlock purchases: Lifetime Pass (₱299) or a single collection (₱49).
// Routed through PayMongo (see shared/paymongo.ts) — no Stripe.
const LIFETIME_PRICE = 29900;  // centavos
const COLLECTION_PRICE = 4900; // centavos
const PMT = ["card", "gcash", "paymaya"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, category, origin } = body;
    if (!origin) return Response.json({ error: "Missing origin" }, { status: 400 });

    const isLifetime = type === "lifetime";
    const isCollection = type === "collection";
    if (!isLifetime && !isCollection) return Response.json({ error: "Invalid type" }, { status: 400 });
    if (isCollection && !category) return Response.json({ error: "Missing category" }, { status: 400 });

    // Skip checkout if already owned.
    if (isLifetime && (user.plan === "lifetime" || user.plan === "premium")) {
      return Response.json({ already: true });
    }
    if (isCollection && (user.owned_collections || []).includes(category)) {
      return Response.json({ already: true });
    }

    const amount = isLifetime ? LIFETIME_PRICE : COLLECTION_PRICE;
    const name = isLifetime ? "windy the pooh Lifetime Pass" : `${category} Collection — windy the pooh`;
    const secretKey = Deno.env.get("PAYMONGO_SECRET_KEY");

    const session = await createCheckoutSession({
      secretKey,
      lineItems: [{ name, amount, currency: "PHP", quantity: 1 }],
      paymentMethodTypes: PMT,
      successUrl: `${origin}/dashboard?unlock=success`,
      cancelUrl: `${origin}/dashboard?unlock=canceled`,
      description: name,
      metadata: {
        unlock_type: type,
        category: category || "",
        user_id: user.id,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    // Remember the pending checkout on the user so confirmUnlock can verify it
    // after PayMongo redirects back (PayMongo does not append the session id).
    await base44.auth.updateMe({
      pending_checkout_id: session.id,
      pending_unlock_type: type,
      pending_unlock_category: category || "",
    });

    return Response.json({ url: session.attributes.checkout_url });
  } catch (error) {
    console.error("createUnlockCheckout error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});