import React, { useMemo, useState } from "react";
import { Search, Eye, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StripPreview from "@/components/booth/StripPreview";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
const PESO = (n) => `₱${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PAY_TONE = { paid: "bg-[#ebfbee] text-[#37b24d]", processing: "bg-[#e7f5ff] text-[#228be6]", pending: "bg-[#fff3bf] text-[#f59f00]", failed: "bg-[#ffe3e3] text-[#DC2626]", refunded: "bg-[#f1f5fb] text-[#94a3b8]" };
const FULFILL = ["processing", "printed", "shipped", "delivered"];
const FULFILL_TONE = { processing: "bg-[#fff3bf] text-[#f59f00]", printed: "bg-[#e7f5ff] text-[#228be6]", shipped: "bg-[#eaf2fd] text-[#3a6cbf]", delivered: "bg-[#ebfbee] text-[#37b24d]" };

export default function AdminOrders({ orders, users, strips, templates, onChanged }) {
  const [q, setQ] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [fillFilter, setFillFilter] = useState("all");
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(null);
  const [track, setTrack] = useState({});

  const userMap = useMemo(() => { const m = {}; users.forEach((u) => (m[u.id] = u)); return m; }, [users]);
  const stripMap = useMemo(() => { const m = {}; strips.forEach((s) => (m[s.id] = s)); return m; }, [strips]);

  const rows = useMemo(() => orders.filter((o) => {
    const u = userMap[o.user_id];
    const name = (u?.full_name || u?.email || "").toLowerCase();
    if (q && !name.includes(q.toLowerCase()) && !(o.id || "").includes(q)) return false;
    if (payFilter !== "all" && o.payment_status !== payFilter) return false;
    if (fillFilter !== "all" && o.fulfillment_status !== fillFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)), [orders, userMap, q, payFilter, fillFilter]);

  const setFulfill = async (o, status) => {
    setBusy(o.id);
    try { await base44.entities.Order.update(o.id, { fulfillment_status: status }); await onChanged(); }
    finally { setBusy(null); }
  };

  const saveTrack = async (o) => {
    const val = (track[o.id] ?? o.jt_tracking_number ?? "").trim();
    if (!val) return;
    setBusy(o.id);
    try { await base44.entities.Order.update(o.id, { jt_tracking_number: val }); setTrack((t) => ({ ...t, [o.id]: undefined })); await onChanged(); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold">Orders <span className="text-sm font-medium text-[#94a3b8]">({orders.length})</span></h2>
        <div className="flex flex-wrap items-center gap-2">
          <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-bold outline-none">
            <option value="all">All payments</option>
            {["pending", "processing", "paid", "failed", "refunded"].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <select value={fillFilter} onChange={(e) => setFillFilter(e.target.value)} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-bold outline-none">
            <option value="all">All fulfillment</option>
            {FULFILL.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer" className="w-48 max-w-[50vw] rounded-full border border-[#e2e8f0] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#228be6]" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e2e8f0] bg-[#FBFAF7] text-left text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Bundle</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Fulfillment</th>
              <th className="px-3 py-2">Tracking</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const u = userMap[o.user_id];
              return (
                <tr key={o.id} className="border-b border-[#F0EBE2] last:border-0 hover:bg-[#FBFAF7]">
                  <td className="px-3 py-2.5"><p className="font-medium">{u?.full_name || "—"}</p><p className="text-xs text-[#94a3b8]">{u?.email || ""}</p></td>
                  <td className="px-3 py-2.5 capitalize">{o.bundle_type} · {o.paper_type}</td>
                  <td className="px-3 py-2.5 font-bold">{PESO(o.total)}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${PAY_TONE[o.payment_status] || "bg-[#f1f5fb]"}`}>{o.payment_status}</span></td>
                  <td className="px-3 py-2.5">
                    <select value={o.fulfillment_status} disabled={busy === o.id} onChange={(e) => setFulfill(o, e.target.value)} className={`rounded-full border-0 px-2 py-1 text-xs font-bold capitalize outline-none ${FULFILL_TONE[o.fulfillment_status]}`}>
                      {FULFILL.map((f) => <option key={f} value={f} className="bg-white text-[#1e1b4b]">{f}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <input value={track[o.id] ?? o.jt_tracking_number ?? ""} onChange={(e) => setTrack((t) => ({ ...t, [o.id]: e.target.value }))} placeholder="—" className="w-24 rounded-full border border-[#e2e8f0] px-2 py-1 text-xs outline-none focus:border-[#228be6]" />
                      <button onClick={() => saveTrack(o)} disabled={busy === o.id} className="rounded-full p-1 text-[#228be6] hover:bg-[#e7f5ff]" title="Save tracking"><Save size={13} /></button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#475569]">{fmtDate(o.created_date)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => setView(o)} className="rounded-full p-1.5 text-[#228be6] hover:bg-[#e7f5ff]" title="View"><Eye size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-[#94a3b8]">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Order details</DialogTitle></DialogHeader>
          {view && (() => {
            const u = userMap[view.user_id];
            const orderStrips = (view.strip_ids || []).map((id) => stripMap[id]).filter(Boolean);
            return (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Info label="Customer" value={u?.full_name || "—"} />
                  <Info label="Email" value={u?.email || "—"} />
                  <Info label="Bundle" value={`${view.bundle_type || "—"} · ${view.paper_type || "—"}`} />
                  <Info label="Quantity" value={`${view.quantity_selected ?? "—"} / ${view.quantity_required ?? "—"}`} />
                  <Info label="Subtotal" value={PESO(view.subtotal)} />
                  <Info label="Shipping" value={PESO(view.shipping_cost)} />
                  <Info label="Total" value={PESO(view.total)} />
                  <Info label="Payment" value={view.payment_status} />
                  <Info label="Fulfillment" value={view.fulfillment_status} />
                  <Info label="Shipping method" value={view.shipping_method || "—"} />
                  <Info label="Tracking" value={view.jt_tracking_number || "—"} />
                  <Info label="Ordered" value={fmtDate(view.created_date)} />
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-[#FBFAF7] px-3 py-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Shipping (J&T Express)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Info label="Recipient" value={view.ship_full_name || "—"} />
                    <Info label="Phone" value={view.ship_phone || "—"} />
                    <Info label="Region" value={view.ship_region || "—"} />
                    <Info label="Province" value={view.ship_province || "—"} />
                    <Info label="City / Municipality" value={view.ship_city || "—"} />
                    <Info label="Barangay" value={view.ship_barangay || "—"} />
                    <Info label="Postal Code" value={view.ship_postal || "—"} />
                    <Info label="Shipping Cost" value={PESO(view.shipping_cost)} />
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Detailed Address</p>
                  <p className="whitespace-pre-wrap">{view.ship_street || view.shipping_address || "—"}</p>
                </div>
                {orderStrips.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Strips in this order</p>
                    <div className="flex flex-wrap gap-3">
                      {orderStrips.map((s) => (
                        <div key={s.id} className="w-20">
                          <StripPreview template={templates[s.template_id]} photos={s.photo_urls} className="w-20" />
                          <p className="mt-1 text-center text-[10px] text-[#94a3b8]">{fmtDate(s.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-[#FBFAF7] px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">{label}</p>
      <p className="truncate font-medium capitalize">{value}</p>
    </div>
  );
}