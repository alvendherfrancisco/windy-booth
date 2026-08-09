import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, Loader2, Minus, Package, Printer, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import PrintShopInfo from "@/components/printshop/PrintShopInfo";
import { BUNDLES, formatPrice, computeTotal, FREE_SHIP_THRESHOLD } from "@/lib/printPricing";
import LocationSelects from "@/components/printshop/LocationSelects";

export default function PrintShop() {
  const { user, printShopEnabled } = useAuth();
  const [strips, setStrips] = useState([]);
  const [templates, setTemplates] = useState({});
  const [bundle, setBundle] = useState("classic");
  const [selected, setSelected] = useState({});
  const [paper, setPaper] = useState("matte");
  const [quantity, setQuantity] = useState(1);
  const [ship, setShip] = useState({ full_name: "", phone: "", region: "", regionCode: "", province: "", city: "", cityCode: "", barangay: "", barangayCode: "", street: "", postal: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      base44.functions.invoke("confirmPrintOrder", {}).
      then((r) => {const d = r?.data ?? r; if (d?.ok === false) { setError("Payment not yet confirmed. Please try again in a moment."); return; } setDone({ order_id: d?.order_id });}).
      catch((e) => setError(e?.message || "Could not confirm payment"));
      window.history.replaceState({}, "", "/print-shop");
    } else if (params.get("canceled") === "1") {
      setError("Checkout was canceled.");
      window.history.replaceState({}, "", "/print-shop");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.Strip.filter({ user_id: user.id, saved: true }, "-created_at").then(setStrips);
    base44.entities.Template.list().then((t) => {const m = {};t.forEach((x) => m[x.id] = x);setTemplates(m);});
  }, [user?.id]);

  if (!printShopEnabled) return <Navigate to="/dashboard" replace />;

  const bundleDef = BUNDLES.find((b) => b.id === bundle);
  const pricing = computeTotal(bundle, quantity, ship.regionCode);

  const totalSelected = Object.values(selected).reduce((a, b) => a + b, 0);
  const addStrip = (id) => {
    setSelected((prev) => {
      const t = Object.values(prev).reduce((a, b) => a + b, 0);
      if (t >= bundleDef.strips) return prev;
      return { ...prev, [id]: (prev[id] || 0) + 1 };
    });
  };
  const decStrip = (id) => {
    setSelected((prev) => { const n = (prev[id] || 0) - 1; const next = { ...prev }; if (n <= 0) delete next[id]; else next[id] = n; return next; });
  };
  const stripIds = Object.entries(selected).flatMap(([id, q]) => Array(q).fill(id));

  const checkout = async () => {
    setError("");
    if (totalSelected !== bundleDef.strips) {setError(`Select exactly ${bundleDef.strips} strip${bundleDef.strips > 1 ? "s" : ""} for the ${bundleDef.name} (you have ${totalSelected}/${bundleDef.strips}).`);return;}
    if (!ship.full_name.trim() || !ship.phone.trim() || !ship.regionCode || !ship.cityCode || !ship.barangayCode || !ship.street.trim()) {setError("Please complete all shipping fields.");return;}
    if (window.self !== window.top) {alert("Checkout works only from the published app.");return;}
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createPrintCheckout", {
        origin: window.location.origin,
        strip_ids: stripIds,
        bundle, paper, quantity,
        ship_full_name: ship.full_name,
        ship_phone: ship.phone,
        ship_region: ship.region,
        ship_region_code: ship.regionCode,
        ship_province: ship.province,
        ship_city: ship.city,
        ship_barangay: ship.barangay,
        ship_street: ship.street,
        ship_postal: ship.postal
      });
      const data = res?.data ?? res;
      if (data?.url) window.location.href = data.url;else
      throw new Error("No checkout URL returned");
    } catch (e) {
      setError(e?.message || "Checkout failed");
    } finally {setBusy(false);}
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md">
        <div className="relative isolate mt-6 overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-[#ebfbee] p-8 text-center">
          <PolkaDots />
          <FaceDoodles variant="success" />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#37b24d]"><Check size={28} /></div>
          <h1 className="font-heading text-2xl font-extrabold text-[#1e1b4b]">Order confirmed!</h1>
          <p className="mt-2 text-sm text-[#475569]">Your Print Club bundle is being prepared. We'll update you when it ships.</p>
          <Link to="/orders" className="mt-6 inline-block rounded-full bg-[#5080da] px-6 py-3 text-sm font-bold text-white hover:bg-[#3a6cbf]">View my orders</Link>
          <button onClick={() => setDone(null)} className="mt-3 block w-full text-sm font-bold text-[#228be6]">Order another bundle</button>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-extrabold">Print Shop</h1>
      <p className="mt-1 text-sm text-[#8B8D93]">Turn your strips into printed keepsakes with Print Club.</p>

      <div className="mt-6"><PrintShopInfo /></div>

      {strips.length === 0 ?
      <div className="relative isolate mt-6 overflow-hidden rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#eaf2fd] px-6 py-14 text-center">
          <PolkaDots />
          <FaceDoodles variant="empty" />
          <Package className="relative mx-auto text-[#3a6cbf]" />
          <p className="relative mt-3 font-heading text-xl font-bold">No strips to print yet</p>
          <p className="relative mt-1 text-sm text-[#8B8D93]">Create a few strips first, then come back to order prints.</p>
          <Link to="/booth" className="relative mt-5 inline-block rounded-full bg-[#5080da] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a6cbf]">Start a booth</Link>
        </div> :

      <>
          <Section title="1. Choose a bundle" icon={Package}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BUNDLES.map((b) => {
              const active = bundle === b.id;
              return (
                <div key={b.id} className={`rounded-2xl border p-4 transition ${active ? "border-[#3a6cbf] bg-[#eaf2fd]" : "border-[#e2e8f0] bg-white hover:border-[#3a6cbf]"}`}>
                  <button onClick={() => {setBundle(b.id);setSelected({});}} className="block w-full text-left">
                    <p className="font-heading text-base font-extrabold text-[#1e1b4b]">{b.name}</p>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">{b.strips} strip{b.strips > 1 ? "s" : ""}</p>
                    <p className="mt-2 font-bold text-[#3a6cbf]">{formatPrice(b.price)}</p>
                  </button>
                  {active && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#f3d6e4] pt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-[#e2e8f0] bg-white text-lg font-bold text-[#1e1b4b] hover:bg-[#f1f5fb]">−</button>
                        <span className="w-6 text-center font-bold">{quantity}</span>
                        <button onClick={() => setQuantity((q) => q + 1)} className="h-8 w-8 rounded-full border border-[#e2e8f0] bg-white text-lg font-bold text-[#1e1b4b] hover:bg-[#f1f5fb]">+</button>
                      </div>
                      <span className="text-sm font-extrabold text-[#1e1b4b]">{formatPrice(b.price * quantity)}</span>
                    </div>
                  )}
                </div>);

            })}
            </div>
            <p className="mt-3 text-xs text-[#94a3b8]">Every bundle includes a sticker sheet and a handwritten letter card.</p>
          </Section>

          <Section title={`2. Select your strips (${totalSelected}/${bundleDef.strips})`} icon={Printer}>
            {totalSelected === bundleDef.strips ?
              <p className="mb-3 text-xs font-bold text-[#37b24d]">✓ Bundle complete — use − to remove a copy, or remove all to swap a strip.</p> :
              <p className="mb-3 text-xs text-[#94a3b8]">Tap a strip to add it — tap again for more copies. Use − to remove a copy.</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {strips.map((s) => {
              const qty = selected[s.id] || 0;
              const disabled = !qty && totalSelected >= bundleDef.strips;
              return (
                <button key={s.id} onClick={() => addStrip(s.id)} disabled={disabled} className={`relative rounded-xl border p-2 transition ${qty ? "border-[#3a6cbf] bg-[#eaf2fd]" : "border-[#e2e8f0] bg-white hover:border-[#3a6cbf]"} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <StripPreview template={templates[s.template_id]} photos={s.photo_urls} className="mx-auto w-full max-w-[100px]" />
                    {qty > 0 && <>
                      <span onClick={(e) => {e.stopPropagation();decStrip(s.id);}} className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#3a6cbf] bg-white text-[#3a6cbf] hover:bg-[#eaf2fd]"><Minus size={12} /></span>
                      <span className="absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#3a6cbf] px-1 text-xs font-bold text-white">×{qty}</span>
                    </>}
                  </button>);

            })}
            </div>
          </Section>

          <Section title="3. Paper type" icon={Printer}>
            <div className="flex gap-2">
              {["matte", "glossy"].map((p) =>
            <button key={p} onClick={() => setPaper(p)} className={`rounded-full border px-4 py-2 text-sm font-bold capitalize transition ${paper === p ? "border-[#228be6] bg-[#e7f5ff] text-[#228be6]" : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#228be6]"}`}>{p}</button>
            )}
            </div>
          </Section>

          <Section title="4. Shipping (J&T Express)" icon={Truck}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ShipField label="Full Name" value={ship.full_name} onChange={(v) => setShip({ ...ship, full_name: v })} placeholder="Juan Dela Cruz" />
              <ShipField label="Phone Number" value={ship.phone} onChange={(v) => setShip({ ...ship, phone: v })} placeholder="09XX XXX XXXX" type="tel" />
            </div>
            <div className="mt-3">
              <LocationSelects value={ship} onChange={setShip} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Detailed Address</span>
                <textarea value={ship.street} onChange={(e) => setShip({ ...ship, street: e.target.value })} rows={2} placeholder="House no., street, block, lot" className="input resize-none" />
              </div>
              <ShipField label="Postal Code" value={ship.postal} onChange={(v) => setShip({ ...ship, postal: v })} placeholder="Postal code" />
            </div>
            <p className="mt-3 text-xs text-[#94a3b8]">J&T Express (under 1kg): Manila ₱95 · Luzon ₱85 · Visayas ₱100 · Mindanao ₱105 · Island ₱115 · Free on orders {formatPrice(FREE_SHIP_THRESHOLD)}+</p>
          </Section>

          <div className="sticky bottom-3 z-10 mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="space-y-1 text-sm">
              <Row label={`Bundle × ${quantity}`} value={formatPrice(pricing.subtotal)} />
              <Row label="Shipping" value={pricing.shipping == null ? "Select region" : pricing.shipping === 0 ? "FREE" : formatPrice(pricing.shipping)} />
              <div className="my-1 border-t border-[#F0EBE2]" />
              <Row label="Total" value={formatPrice(pricing.total)} bold />
            </div>
            {error && <p className="mt-2 text-sm font-bold text-[#DC2626]">{error}</p>}
            <button onClick={checkout} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#5080da] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:bg-[#e2e8f0]">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Preparing checkout…</> : <><Printer size={16} /> Checkout · {formatPrice(pricing.total)}</>}
            </button>
          </div>
        </>
      }
    </div>);

}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-extrabold text-[#1e1b4b]"><Icon size={18} className="text-[#3a6cbf]" /> {title}</h2>
      {children}
    </section>);

}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-[#1e1b4b]" : "text-[#475569]"}>{label}</span>
      <span className={bold ? "font-heading text-lg font-extrabold text-[#3a6cbf]" : "font-medium text-[#1e1b4b]"}>{value}</span>
    </div>);

}

function ShipField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    </label>
  );
}