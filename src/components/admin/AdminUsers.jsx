import React, { useMemo, useState } from "react";
import { Search, Eye, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StripPreview from "@/components/booth/StripPreview";
import { planLabel } from "@/lib/plans";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

export default function AdminUsers({ users, strips, templates, meId, onChanged }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "created_date", dir: "desc" });
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(null);
  const [grantCat, setGrantCat] = useState("");

  const stripCount = useMemo(() => {
    const m = {};
    strips.forEach((s) => (m[s.user_id] = (m[s.user_id] || 0) + 1));
    return m;
  }, [strips]);

  const lastActive = useMemo(() => {
    const m = {};
    strips.forEach((s) => {
      const t = new Date(s.created_at).getTime();
      if (!m[s.user_id] || t > m[s.user_id]) m[s.user_id] = t;
    });
    return m;
  }, [strips]);

  const rows = useMemo(() => {
    const r = users.filter((u) =>
      (u.full_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(q.toLowerCase())
    );
    const k = sort.key;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => {
      let av, bv;
      if (k === "strips") { av = stripCount[a.id] || 0; bv = stripCount[b.id] || 0; }
      else if (k === "lastActive") { av = lastActive[a.id] || 0; bv = lastActive[b.id] || 0; }
      else if (k === "plan") { av = a.plan || "free"; bv = b.plan || "free"; }
      else { av = a[k] || ""; bv = b[k] || ""; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [users, q, sort, stripCount, lastActive]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  const setPlan = async (u, plan) => {
    setBusy(u.id);
    try {
      const payload = { plan };
      if (plan === "lifetime") payload.plan_renewed_at = new Date().toISOString();
      await base44.entities.User.update(u.id, payload);
      await onChanged();
    } finally { setBusy(null); }
  };

  const premiumCategories = useMemo(() => {
    const set = new Set();
    Object.values(templates).forEach((t) => { if (t.tier === "premium" && t.category) set.add(t.category); });
    return [...set].sort();
  }, [templates]);

  const grantCollection = async (u, category) => {
    if (!category) return;
    setBusy(u.id);
    try {
      const owned = u.owned_collections || [];
      if (!owned.includes(category)) {
        const newOwned = [...owned, category];
        await base44.entities.User.update(u.id, { owned_collections: newOwned });
        setView({ ...u, owned_collections: newOwned });
        await onChanged();
      }
    } finally { setBusy(null); }
  };

  const revokeCollection = async (u, category) => {
    setBusy(u.id);
    try {
      const newOwned = (u.owned_collections || []).filter((c) => c !== category);
      await base44.entities.User.update(u.id, { owned_collections: newOwned });
      setView({ ...u, owned_collections: newOwned });
      await onChanged();
    } finally { setBusy(null); }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete ${u.email}? This also removes their strips and cannot be undone.`)) return;
    setBusy(u.id);
    try {
      await base44.entities.Strip.deleteMany({ user_id: u.id });
      await base44.entities.User.delete(u.id);
      setView(null);
      await onChanged();
    } finally { setBusy(null); }
  };

  const TH = ({ k, children }) => (
    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-[#1e1b4b]">
        {children}
        {sort.key === k && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    </th>
  );

  const userStrips = view ? strips.filter((s) => s.user_id === view.id) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold">Users <span className="text-sm font-medium text-[#94a3b8]">({users.length})</span></h2>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="w-64 max-w-[60vw] rounded-full border border-[#e2e8f0] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#228be6]" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e2e8f0] bg-[#FBFAF7]">
            <tr>
              <TH k="full_name">Name</TH>
              <TH k="email">Email</TH>
              <TH k="created_date">Joined</TH>
              <TH k="plan">Plan</TH>
              <TH k="strips">Strips</TH>
              <TH k="lastActive">Last active</TH>
              <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const isMe = u.id === meId;
              return (
                <tr key={u.id} className="border-b border-[#F0EBE2] last:border-0 hover:bg-[#FBFAF7]">
                  <td className="px-3 py-2.5 font-medium">{u.full_name || "—"}</td>
                  <td className="px-3 py-2.5 text-[#475569]">{u.email}</td>
                  <td className="px-3 py-2.5 text-[#475569]">{fmtDate(u.created_date)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.plan === "lifetime" ? "bg-[#eaf2fd] text-[#3a6cbf]" : (u.owned_collections?.length ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#e7f5ff] text-[#228be6]")}`}>
                      {planLabel(u)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#475569]">{stripCount[u.id] || 0}</td>
                  <td className="px-3 py-2.5 text-[#475569]">{lastActive[u.id] ? fmtDate(lastActive[u.id]) : fmtDate(u.created_date)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setView(u)} className="rounded-full p-1.5 text-[#228be6] hover:bg-[#e7f5ff]" title="View details"><Eye size={15} /></button>
                      <select
                        value={u.plan || "free"}
                        disabled={busy === u.id || isMe}
                        onChange={(e) => setPlan(u, e.target.value)}
                        className="rounded-full border border-[#e2e8f0] bg-white px-2 py-1 text-xs font-bold outline-none disabled:opacity-50"
                        title={isMe ? "You can't change your own plan here" : "Change plan"}
                      >
                        <option value="free">Free</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                      <button onClick={() => deleteUser(u)} disabled={busy === u.id || isMe} className="rounded-full p-1.5 text-[#DC2626] hover:bg-[#ffe3e3] disabled:opacity-40" title={isMe ? "You can't delete your own account" : "Delete account"}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-[#94a3b8]">No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{view?.full_name || "User"}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Info label="Email" value={view.email} />
                <Info label="Plan" value={planLabel(view)} />
                <Info label="Joined" value={fmtDate(view.created_date)} />
                <Info label="Strips" value={String(stripCount[view.id] || 0)} />
                <Info label="Last active" value={lastActive[view.id] ? fmtDate(lastActive[view.id]) : fmtDate(view.created_date)} />
                <Info label="Role" value={view.role || "user"} />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Owned collections</p>
                <div className="flex flex-wrap gap-2">
                  {(view.owned_collections || []).length === 0 && <p className="text-xs text-[#94a3b8]">No collections unlocked.</p>}
                  {(view.owned_collections || []).map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-bold text-[#b45309]">
                      {c}
                      <button onClick={() => revokeCollection(view, c)} disabled={busy === view.id} className="text-[#b45309] hover:text-[#DC2626] disabled:opacity-50">×</button>
                    </span>
                  ))}
                </div>
                {premiumCategories.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <select value={grantCat} onChange={(e) => setGrantCat(e.target.value)} disabled={busy === view.id} className="flex-1 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-bold outline-none disabled:opacity-50">
                      <option value="" disabled>Grant a collection…</option>
                      {premiumCategories.filter((c) => !(view.owned_collections || []).includes(c)).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => { grantCollection(view, grantCat); setGrantCat(""); }} disabled={busy === view.id || !grantCat} className="rounded-full bg-[#3a6cbf] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2f5fbf] disabled:opacity-50">Grant</button>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Saved strips</p>
                {userStrips.length === 0 ? (
                  <p className="text-[#94a3b8]">No strips yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {userStrips.map((s) => (
                      <div key={s.id} className="w-20">
                        <StripPreview template={templates[s.template_id]} photos={s.photo_urls} className="w-20" />
                        <p className="mt-1 text-center text-[10px] text-[#94a3b8]">{fmtDate(s.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => deleteUser(view)} disabled={busy === view.id || view.id === meId} className="inline-flex items-center gap-1.5 rounded-full bg-[#ffe3e3] px-4 py-2 text-sm font-bold text-[#DC2626] hover:bg-[#ffcccc] disabled:opacity-50">
                <Trash2 size={15} /> Delete account
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-[#FBFAF7] px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}