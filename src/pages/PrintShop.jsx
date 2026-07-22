import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getBundle } from "@/components/printshop/data";
import BundleGrid from "@/components/printshop/BundleGrid";
import StripPicker from "@/components/printshop/StripPicker";
import CartStep from "@/components/printshop/CartStep";
import CheckoutStep from "@/components/printshop/CheckoutStep";
import OrderHistory from "@/components/printshop/OrderHistory";

const STEP_ORDER = ["bundle", "picker", "cart", "checkout"];

export default function PrintShop() {
  const { user } = useAuth();
  const [step, setStep] = useState("bundle");
  const [bundle, setBundle] = useState(null);
  const [paper, setPaper] = useState("matte");
  const [stripIds, setStripIds] = useState([]);
  const [strips, setStrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipping, setShipping] = useState(null);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");

  const load = async () => {
    setStrips(await base44.entities.Strip.filter({ saved: true }, "-created_at"));
    setOrders(await base44.entities.Order.filter({}, "-created_date"));
  };
  useEffect(() => {
    load();
    const off = base44.entities.Order.subscribe(load);
    return off;
  }, []);

  // Handle Stripe redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const canceled = params.get("canceled");
    const orderId = params.get("order");
    const session = params.get("session");
    if (paid && orderId && session) {
      base44.functions
        .invoke("confirm-print-payment", { orderId, sessionId: session, userId: user?.id })
        .then((r) => {
          const data = r.data || r;
          if (data?.ok) {
            setResult({ ok: true, orderId });
            setStep("done");
          } else {
            restoreOrder(orderId);
            setNotice("Payment didn't go through. Your selection is saved — try again.");
          }
        })
        .catch(() => {
          restoreOrder(orderId);
          setNotice("Payment couldn't be confirmed. Your selection is saved — try again.");
        });
      window.history.replaceState({}, "", "/print-shop");
    } else if (canceled && orderId) {
      restoreOrder(orderId);
      setNotice("Payment canceled. Your selection is saved.");
      window.history.replaceState({}, "", "/print-shop");
    }
    // eslint-disable-next-line
  }, []);

  const restoreOrder = async (orderId) => {
    try {
      const order = await base44.entities.Order.get(orderId);
      if (order) {
        setBundle(getBundle(order.bundle_type));
        setPaper(order.paper_type);
        setStripIds(order.strip_ids || []);
        setStep("cart");
      }
    } catch (e) {
      setStep("bundle");
    }
  };

  const subtotal = bundle?.price || 0;
  const toggleStrip = (id) =>
    setStripIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < bundle.strips ? [...prev, id] : prev
    );

  const reset = () => {
    setStep("bundle");
    setBundle(null);
    setStripIds([]);
    setResult(null);
    setNotice("");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl font-extrabold">Print Shop</h1>
      <p className="mt-1 text-sm text-[#8A8580]">Turn your strips into printed keepsakes.</p>

      {notice && (
        <p className="mt-4 rounded-lg bg-[#FDE8E4] px-4 py-3 text-sm font-bold text-[#DC3522]">{notice}</p>
      )}

      {step === "done" && result?.ok ? (
        <div className="mt-6 rounded-[18px] border border-[#E8E2D8] bg-white p-8 text-center">
          <CheckCircle2 size={40} className="mx-auto text-[#4F46E5]" />
          <h2 className="mt-4 font-heading text-2xl font-extrabold text-[#2D2D2D]">Order confirmed!</h2>
          <p className="mt-1 text-sm text-[#8A8580]">Your print order is being processed. We'll notify you when it ships.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/orders" className="rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F]">
              View orders
            </Link>
            <button onClick={reset} className="rounded-full border border-[#4F46E5] px-5 py-3 text-sm font-bold text-[#4F46E5]">
              New order
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold">
            {STEP_ORDER.map((s) => {
              const idx = STEP_ORDER.indexOf(step);
              const i = STEP_ORDER.indexOf(s);
              return (
                <span
                  key={s}
                  className={`rounded-full px-3 py-1 capitalize ${
                    i === idx ? "bg-[#DC3522] text-white" : i < idx ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#F5F0EA] text-[#8A8580]"
                  }`}
                >
                  {s}
                </span>
              );
            })}
          </div>

          {step === "bundle" && (
            <div className="mt-5">
              <BundleGrid selected={bundle} onSelect={(b) => { setBundle(b); setStripIds([]); }} />
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm text-[#5C5953]">Paper:</span>
                {["matte", "glossy"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaper(p)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold capitalize transition ${
                      paper === p ? "border-[#4F46E5] bg-[#4F46E5] text-white" : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#4F46E5]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {bundle && (
                <button
                  onClick={() => setStep("picker")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#DC3522] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F]"
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {step === "picker" && bundle && (
            <div className="mt-5">
              <StripPicker strips={strips} required={bundle.strips} selectedIds={stripIds} onToggle={toggleStrip} />
              <div className="mt-5 flex gap-3">
                <button onClick={() => setStep("bundle")} className="rounded-full border border-[#E8E2D8] px-5 py-3 text-sm font-bold text-[#5C5953]">
                  Back
                </button>
                <button
                  disabled={stripIds.length !== bundle.strips}
                  onClick={() => setStep("cart")}
                  className="rounded-full bg-[#DC3522] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B82E1F] disabled:bg-[#E8E2D8] disabled:text-[#8A8580]"
                >
                  {stripIds.length !== bundle.strips ? `Select ${bundle.strips - stripIds.length} more` : "Add to cart"}
                </button>
              </div>
            </div>
          )}

          {step === "cart" && bundle && (
            <div className="mt-5">
              <CartStep
                bundle={bundle}
                paper={paper}
                selectedCount={stripIds.length}
                shipping={shipping}
                onCheckout={() => setStep("checkout")}
                onBack={() => setStep("picker")}
              />
            </div>
          )}

          {step === "checkout" && bundle && (
            <div className="mt-5">
              <CheckoutStep
                bundle={bundle}
                paper={paper}
                stripIds={stripIds}
                subtotal={subtotal}
                setShipping={setShipping}
                onBack={() => setStep("cart")}
                userId={user?.id}
              />
            </div>
          )}
        </>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-xl font-extrabold">Order history</h2>
          <Link to="/orders" className="text-sm font-bold text-[#4F46E5]">See all</Link>
        </div>
        <OrderHistory orders={orders} />
      </section>
    </div>
  );
}