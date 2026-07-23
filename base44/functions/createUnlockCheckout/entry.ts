import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@14.25.0';

// One-time unlock purchases: Lifetime Pass (₱299) or a single collection (₱49).
const LIFETIME_PRICE = 29900;  // centavos
const COLLECTION_PRICE = 4900; // centavos
const CURRENCY = "php";

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

    const unit_amount = isLifetime ? LIFETIME_PRICE : COLLECTION_PRICE;
    const name = isLifetime ? "Lifetime Pass — Vendhee" : `${category} Collection — Vendhee`;
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : "";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: { currency: CURRENCY, unit_amount, product_data: { name } },
      }],
      success_url: `${origin}/dashboard?unlock=success&session={CHECKOUT_SESSION_ID}&type=${type}${categoryParam}`,
      cancel_url: `${origin}/dashboard?unlock=canceled`,
      metadata: {
        unlock_type: type,
        category: category || "",
        user_id: user.id,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("createUnlockCheckout error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});