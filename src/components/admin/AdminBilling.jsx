import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
const PESO = (n) => `₱${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const STATUS_TONE = { paid: "bg-[#ebfbee] text-[#37b24d]", failed: "bg-[#ffe3e3] text-[#DC2626]", refunded: "bg-[#F5F0EA] text-[#8A8580]" };

export default function AdminBilling({ billing, users }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const userMap = useMemo(() => { const m = {}; users.forEach((u) => (m[u.id] = u)); return m; }, [users]);

  const rows = useMemo(() => billing.filter((b) => {
    const u = userMap[b.user_id];
    const name = (u?.full_name || u?.email || "").toLowerCase();
    if (q && !name.includes(q.toLowerCase())) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [billing, userMap, q, statusFilter]);

  const revenue = useMemo(() => billing.filter((b) => b.status === "paid").reduce((s, b) => s + (b.amount || 0), 0), [billing]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold">Billing <span className="text-sm font-medium text-[#8A8580]">({billing.length})</span></h2>
          <p className="text-sm text-[#8A8580]">Collected revenue: <b className="text-[#37b24d]">{PESO(revenue)}</b></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-[#E8E2D8] bg-white px-3 py-2 text-xs font-bold outline-none">
            <option value="all">All statuses</option>
            {["paid", "failed", "refunded"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8580]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer" className="w-48 max-w-[50vw] rounded-full border border-[#E8E2D8] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#228be6]" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E8E2D8] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#E8E2D8] bg-[#FBFAF7] text-left text-xs font-bold uppercase tracking-wider text-[#8A8580]">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Transaction</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const u = userMap[b.user_id];
              return (
                <tr key={b.id} className="border-b border-[#F0EBE2] last:border-0 hover:bg-[#FBFAF7]">
                  <td className="px-3 py-2.5"><p className="font-medium">{u?.full_name || "—"}</p><p className="text-xs text-[#8A8580]">{u?.email || ""}</p></td>
                  <td className="px-3 py-2.5 capitalize">{b.type === "print_order" ? "Print order" : "Subscription"}</td>
                  <td className="px-3 py-2.5 font-bold">{PESO(b.amount)}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STATUS_TONE[b.status] || "bg-[#F5F0EA]"}`}>{b.status}</span></td>
                  <td className="px-3 py-2.5 text-xs text-[#5C5953]">{b.paymongo_transaction_id || "—"}</td>
                  <td className="px-3 py-2.5 text-[#5C5953]">{fmtDate(b.created_at)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-[#8A8580]">No billing records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}