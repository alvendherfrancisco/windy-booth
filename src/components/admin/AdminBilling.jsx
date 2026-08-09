import React, { useMemo, useState } from "react";
import { Search, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PESO, toPhp } from "@/lib/currency";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
const STATUS_TONE = { paid: "bg-[#ebfbee] text-[#37b24d]", failed: "bg-[#ffe3e3] text-[#DC2626]", refunded: "bg-[#f1f5fb] text-[#94a3b8]" };

export default function AdminBilling({ billing, users, unlockRequests, onChanged }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [delBusy, setDelBusy] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saveBusy, setSaveBusy] = useState(null);

  const userMap = useMemo(() => { const m = {}; users.forEach((u) => (m[u.id] = u)); return m; }, [users]);
  const reqMap = useMemo(() => { const m = {}; unlockRequests?.forEach((r) => (m[r.id] = r)); return m; }, [unlockRequests]);

  const linkedRequest = (b) => {
    const txId = b.paymongo_transaction_id || "";
    const unlockId = txId.startsWith("unlock-") ? txId.slice(7) : null;
    return unlockId ? reqMap[unlockId] : null;
  };

  const del = async (b) => {
    if (!window.confirm("Delete this billing record? This will revoke the user's access and remove the associated unlock request.")) return;
    setDelBusy(b.id);
    try {
      const req = linkedRequest(b);
      if (req) {
        const u = userMap[b.user_id];
        if (u) {
          if (req.plan_type === "lifetime") {
            await base44.entities.User.update(u.id, { plan: "free" });
          } else if (req.plan_type === "collection" && req.collection) {
            const owned = (u.owned_collections || []).filter((c) => c !== req.collection);
            await base44.entities.User.update(u.id, { owned_collections: owned });
          }
        }
        await base44.entities.UnlockRequest.delete(req.id);
      } else if (b.type === "subscription") {
        const u = userMap[b.user_id];
        if (u) await base44.entities.User.update(u.id, { plan: "free" });
      }
      await base44.entities.BillingRecord.delete(b.id);
      await onChanged();
    } finally {
      setDelBusy(null);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditValue(toPhp(b.amount, b.amount_php).toFixed(2));
  };

  const saveEdit = async (b) => {
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0) return;
    setSaveBusy(b.id);
    try {
      await base44.entities.BillingRecord.update(b.id, { amount_php: parsed });
      const req = linkedRequest(b);
      if (req) await base44.entities.UnlockRequest.update(req.id, { amount_php: parsed });
      setEditingId(null);
      await onChanged();
    } finally {
      setSaveBusy(null);
    }
  };

  const rows = useMemo(() => billing.filter((b) => {
    const u = userMap[b.user_id];
    const name = (u?.full_name || u?.email || "").toLowerCase();
    if (q && !name.includes(q.toLowerCase())) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [billing, userMap, q, statusFilter]);

  const revenue = useMemo(() => billing.filter((b) => b.status === "paid").reduce((s, b) => s + toPhp(b.amount, b.amount_php), 0), [billing]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold">Billing <span className="text-sm font-medium text-[#94a3b8]">({billing.length})</span></h2>
          <p className="text-sm text-[#94a3b8]">Collected revenue: <b className="text-[#37b24d]">{PESO(revenue)}</b></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-bold outline-none">
            <option value="all">All statuses</option>
            {["paid", "failed", "refunded"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
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
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Transaction</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const u = userMap[b.user_id];
              const isEditing = editingId === b.id;
              return (
                <tr key={b.id} className="border-b border-[#F0EBE2] last:border-0 hover:bg-[#FBFAF7]">
                  <td className="px-3 py-2.5"><p className="font-medium">{u?.full_name || "—"}</p><p className="text-xs text-[#94a3b8]">{u?.email || ""}</p></td>
                  <td className="px-3 py-2.5 capitalize">{b.type === "print_order" ? "Print order" : b.type === "unlock" ? "Unlock" : "Subscription"}</td>
                  <td className="px-3 py-2.5 font-bold">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span>₱</span>
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 rounded-md border border-[#e2e8f0] px-1.5 py-1 text-sm outline-none focus:border-[#228be6]"
                        />
                        <button onClick={() => saveEdit(b)} disabled={saveBusy === b.id} className="rounded-full p-1 text-[#37b24d] hover:bg-[#ebfbee] disabled:opacity-50">
                          {saveBusy === b.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-full p-1 text-[#94a3b8] hover:bg-[#f1f5fb]"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-1.5">
                        {PESO(toPhp(b.amount, b.amount_php))}
                        <button onClick={() => startEdit(b)} className="rounded-full p-1 text-[#94a3b8] opacity-0 transition group-hover:opacity-100 hover:bg-[#f1f5fb] hover:text-[#228be6]" title="Edit amount">
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STATUS_TONE[b.status] || "bg-[#f1f5fb]"}`}>{b.status}</span></td>
                  <td className="px-3 py-2.5 text-xs text-[#475569]">{b.paymongo_transaction_id || "—"}</td>
                  <td className="px-3 py-2.5 text-[#475569]">{fmtDate(b.created_at)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => del(b)} disabled={delBusy === b.id} className="rounded-full p-1.5 text-[#DC2626] hover:bg-[#ffe3e3] disabled:opacity-50" title="Delete billing record">
                      {delBusy === b.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-[#94a3b8]">No billing records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}