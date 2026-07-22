import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SHIPPING_ZONES, calcShippingLocal } from "@/components/printshop/data";

export default function CheckoutStep({ bundle, paper, stripIds, subtotal, setShipping, onBack, userId }) {
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", zone: "metro", postal: "" });
  const [ship, setShip] = useState(null);
  const [loadingShip, setLoadingShip] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingShip(true);
    base44.functions
      .invoke("calculate-shipping", { zone: form.zone, subtotal })
      .then((r) => {
        const data = r.data || r;
        if (active) {
          setShip(data);
          setShipping(data);
        }
      })
      .catch(() => {
        if (active) {
          const f = calcShippingLocal(form.zone, subtotal);
          setShip(f);
          setShipping(f);
        }
      })
      .finally(() => {
        if (active) setLoadingShip(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line
  }, [form.zone, subtotal]);

  const isIntl = form.zone === "international";
  const totalAmount = subtotal + (ship?.cost || 0);

  const handlePay = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city) {
      setError("Please complete your shipping address.");
      return;
    }
    setError("");
    // Checkout only works on a published app (not in the preview iframe).
    if (window.self !== window.top) {
      setError("Checkout works only from the published app. Publish your app to pay.");
      return;
    }
    setPaying(true);
    try {
      const r = await base44.functions.invoke("create-print-checkout", {
        bundleId: bundle.id,
        paperType: paper,
        stripIds,
        address: form,
        zone: form.zone,
        userId,
      });
      const data = r.data || r;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError(data?.error || "Could not start payment.");
        setPaying(false);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Payment failed to start.");
      setPaying(false);
    }
  };

  const inputCls =
    "rounded-xl border border-[#E8E2D8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#DC3522]";

  return (
    <div className="rounded-[18px] border border-[#E8E2D8] bg-white p-6">
      <h2 className="font-heading text-xl font-extrabold text-[#2D2D2D]">Shipping & payment</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={inputCls} />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={inputCls} />
        <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address line" className={`${inputCls} sm:col-span-2`} />
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className={inputCls} />
        <input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} placeholder="Postal code" className={inputCls} />
        <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className={`${inputCls} sm:col-span-2`}>
          {Object.entries(SHIPPING_ZONES).map(([k, z]) => (
            <option key={k} value={k}>{z.label}</option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F5F0EA] px-4 py-3 text-sm">
        <span className="text-[#5C5953]">Shipping ({SHIPPING_ZONES[form.zone]?.label})</span>
        {loadingShip ? (
          <Loader2 className="animate-spin text-[#4F46E5]" size={16} />
        ) : (
          <b className="text-[#2D2D2D]">{ship?.free ? "Free" : `₱${ship?.cost}`}</b>
        )}
      </div>
      <div className="mt-2 flex justify-between text-base">
        <b className="text-[#2D2D2D]">Total</b>
        <b className="text-[#2D2D2D]">₱{totalAmount}</b>
      </div>
      <p className="mt-2 text-xs text-[#8A8580]">
        {isIntl ? "International orders: card payment only." : "Pay with GCash, Maya, or card via Stripe."}
      </p>
      {error && (
        <p className="mt-3 rounded-lg bg-[#FDE8E4] px-3 py-2 text-xs font-bold text-[#DC2626]">{error}</p>
      )}
      <div className="mt-5 flex gap-3">
        <button onClick={onBack} disabled={paying} className="rounded-full border border-[#E8E2D8] px-5 py-3 text-sm font-bold text-[#5C5953]">
          Back
        </button>
        <button onClick={handlePay} disabled={paying} className="flex-1 rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8]">
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />Processing…
            </span>
          ) : (
            `Pay ₱${totalAmount}`
          )}
        </button>
      </div>
    </div>
  );
}