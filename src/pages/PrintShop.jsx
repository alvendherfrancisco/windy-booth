import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Package, Printer, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StripPreview from "@/components/booth/StripPreview";
import PolkaDots from "@/components/PolkaDots";
import FaceDoodles from "@/components/FaceDoodles";
import PrintShopInfo from "@/components/printshop/PrintShopInfo";
import { BUNDLES, formatPrice, computeTotal, FREE_SHIP_THRESHOLD, PHILIPPINE_REGIONS } from "@/lib/printPricing";

export default function PrintShop() {
  const { user } = useAuth();
  const [strips, setStrips] = useState([]);
  const [templates, setTemplates] = useState({});
  const [bundle, setBundle] = useState("classic");
  const [selected, setSelected] = useState([]);
  const [paper, setPaper] = useState("matte");
  const [quantity, setQuantity] = useState(1);
  const [ship, setShip] = useState({ full_name: "", phone: "", region: "", province: "", city: "", barangay: "", street: "", postal: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session");
    if (params.get("success") === "1" && sid) {
      base44.functions.invoke("confirmPrintOrder", { session_id: sid }).
      then((r) => {const d = r?.data ?? r;setDone({ order_id: d?.order_id });}).
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

  const bundleDef = BUNDLES.find((b) => b.id === bundle);
  const pricing = computeTotal(bundle, quantity, ship.region);

  const toggleStrip = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= bundleDef.strips) return prev;
      return [...prev, id];
    });
  };

  const checkout = async () => {
    setError("");
    if (selected.length === 0) {setError("Select at least one strip to print.");return;}
    const required = ["full_name", "phone", "region", "province", "city", "barangay", "street"];
    if (required.some((k) => !ship[k]?.trim())) {setError("Please complete all shipping fields.");return;}
    if (window.self !== window.top) {alert("Checkout works only from the published app.");return;}
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createPrintCheckout", {
        origin: window.location.origin,
        strip_ids: selected,
        bundle, paper, quantity, ...ship
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
        <div className="relative isolate mt-6 overflow-hidden rounded-[22px] border border-[#E8E2D8] bg-[#ebfbee] p-8 text-center">
          <PolkaDots />
          <FaceDoodles variant="success" />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#37b24d]"><Check size={28} /></div>
          <h1 className="font-heading text-2xl font-extrabold text-[#2D2D2D]">Order confirmed!</h1>
          <p className="mt-2 text-sm text-[#5C5953]">Your Print Club bundle is being prepared. We'll update you when it ships.</p>
          <Link to="/orders" className="mt-6 inline-block rounded-full bg-[#f06595] px-6 py-3 text-sm font-bold text-white hover:bg-[#e64980]">View my orders</Link>
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
      <div className="relative isolate mt-6 overflow-hidden rounded-[18px] border border-dashed border-[#AEB0B5] bg-[#fff0f6] px-6 py-14 text-center">
          <PolkaDots />
          <FaceDoodles variant="empty" />
          <Package className="relative mx-auto text-[#e64980]" />
          <p className="relative mt-3 font-heading text-xl font-bold">No strips to print yet</p>
          <p className="relative mt-1 text-sm text-[#8B8D93]">Create a few strips first, then come back to order prints.</p>
          <Link to="/booth" className="relative mt-5 inline-block rounded-full bg-[#f06595] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e64980]">Start a booth</Link>
        </div> :

      <>
          <Section title={`1. Choose a bundle`} icon={Package}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BUNDLES.map((b) => {
              const active = bundle === b.id;
              return (
                <button key={b.id} onClick={() => {setBundle(b.id);setSelected((s) => s.slice(0, b.strips));}} className={`rounded-2xl border p-4 text-left transition ${active ? "border-[#e64980] bg-[#fff0f6]" : "border-[#E8E2D8] bg-white hover:border-[#e64980]"}`}>
                    <p className="font-heading text-base font-extrabold text-[#2D2D2D]">{b.name}</p>
                    <p className="mt-0.5 text-xs text-[#8A8580]">{b.strips} strips + sticker sheet + letter card</p>
                    <p className="mt-2 font-bold text-[#e64980]">{formatPrice(b.price)}</p>
                    {active && <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--sidebar-ring))]">Selected</span>}
                  </button>);

            })}
            </div>
          </Section>

          <Section title={`2. Select your strips (${selected.length}/${bundleDef.strips})`} icon={Printer}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {strips.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleStrip(s.id)} className={`relative rounded-xl border p-2 transition ${on ? "border-[#e64980] bg-[#fff0f6]" : "border-[#E8E2D8] bg-white hover:border-[#e64980]"}`}>
                    <StripPreview template={templates[s.template_id]} photos={s.photo_urls} className="mx-auto w-full max-w-[100px]" />
                    {on && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e64980] text-white"><Check size={12} /></span>}
                  </button>);

            })}
            </div>
          </Section>

          <Section title="3. Paper & copies" icon={Printer}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8A8580]">Paper type</p>
                <div className="flex gap-2">
                  {["matte", "glossy"].map((p) =>
                <button key={p} onClick={() => setPaper(p)} className={`rounded-full border px-4 py-2 text-sm font-bold capitalize transition ${paper === p ? "border-[#228be6] bg-[#e7f5ff] text-[#228be6]" : "border-[#E8E2D8] bg-white text-[#5C5953] hover:border-[#228be6]"}`}>{p}</button>
                )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8A8580]">Copies</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-9 w-9 rounded-full border border-[#E8E2D8] bg-white text-lg font-bold text-[#2D2D2D] hover:bg-[#F5F0EA]">−</button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="h-9 w-9 rounded-full border border-[#E8E2D8] bg-white text-lg font-bold text-[#2D2D2D] hover:bg-[#F5F0EA]">+</button>
                </div>
              </div>
            </div>
          </Section>

          <Section title="4. Shipping (J&T Express)" icon={Truck}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ShipField label="Full Name" value={ship.full_name} onChange={(v) => setShip({ ...ship, full_name: v })} placeholder="Juan Dela Cruz" />
              <ShipField label="Phone Number" value={ship.phone} onChange={(v) => setShip({ ...ship, phone: v })} placeholder="09XX XXX XXXX" />
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8A8580]">Region</span>
                <select value={ship.region} onChange={(e) => setShip({ ...ship, region: e.target.value })} className="input">
                  <option value="">Select region…</option>
                  {PHILIPPINE_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <ShipField label="Province" value={ship.province} onChange={(v) => setShip({ ...ship, province: v })} placeholder="Province" />
              <ShipField label="City / Municipality" value={ship.city} onChange={(v) => setShip({ ...ship, city: v })} placeholder="City / Municipality" />
              <ShipField label="Barangay" value={ship.barangay} onChange={(v) => setShip({ ...ship, barangay: v })} placeholder="Barangay" />
              <div className="sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8A8580]">Detailed Address</span>
                <textarea value={ship.street} onChange={(e) => setShip({ ...ship, street: e.target.value })} rows={2} placeholder="House no., street, block, lot" className="input resize-none" />
              </div>
              <ShipField label="Postal Code" value={ship.postal} onChange={(v) => setShip({ ...ship, postal: v })} placeholder="Postal code" />
            </div>
            <p className="mt-3 text-xs text-[#8A8580]">J&T Express rates: Metro Manila ₱75 · Provincial ₱120 · Free on orders {formatPrice(FREE_SHIP_THRESHOLD)}+</p>
          </Section>

          <div className="sticky bottom-3 z-10 mt-6 rounded-2xl border border-[#E8E2D8] bg-white p-4 shadow-sm">
            <div className="space-y-1 text-sm">
              <Row label={`Bundle × ${quantity}`} value={formatPrice(pricing.subtotal)} />
              <Row label="Shipping" value={pricing.shipping === 0 ? "FREE" : formatPrice(pricing.shipping)} />
              <div className="my-1 border-t border-[#F0EBE2]" />
              <Row label="Total" value={formatPrice(pricing.total)} bold />
            </div>
            {error && <p className="mt-2 text-sm font-bold text-[#DC2626]">{error}</p>}
            <button onClick={checkout} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#f06595] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#e64980] disabled:bg-[#E8E2D8]">
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
      <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-extrabold text-[#2D2D2D]"><Icon size={18} className="text-[#e64980]" /> {title}</h2>
      {children}
    </section>);

}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-[#2D2D2D]" : "text-[#5C5953]"}>{label}</span>
      <span className={bold ? "font-heading text-lg font-extrabold text-[#e64980]" : "font-medium text-[#2D2D2D]"}>{value}</span>
    </div>);

}

function ShipField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8A8580]">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    </label>
  );
}