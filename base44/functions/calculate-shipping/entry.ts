import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { calcShipping, SHIPPING_ZONES } from "../../shared/print.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { zone, subtotal } = await req.json();
    // J&T live rate is not configured yet — fall back to the zone flat-rate table.
    // When J&T credentials are available, attempt the live call here and only fall
    // back to calcShipping() if the live call fails (method would then be "jt_live").
    const result = calcShipping(zone, Number(subtotal) || 0);
    return Response.json({ ...result, zones: SHIPPING_ZONES });
  } catch (error) {
    console.error("calculate-shipping error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});